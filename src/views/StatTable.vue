<template>
  <v-card flat title="Player Statistics">
    <template v-slot:text>
      <stat-filters
        :groups="groupedData"
        @update="filters = $event" />
    </template>
    <v-data-table
      :headers="headers"
      :items="filteredStats"
      :search="search"
      :loading="!!loaders.scrape"
      :sort-by="defaultSort"
      class="elevation-1"
      item-value="title"
      hover>
      <template v-slot:item.C="{ value }">
        <span :class="value < 0 ? 'text-red font-weight-bold' : 'text-green'">
          {{ value }}
        </span>
      </template>

      <template v-slot:item.CA="{ value }">
        <span :class="value < 0 ? 'text-red font-weight-bold' : 'text-green'">
          {{ value }}
        </span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { STAT_COLUMNS } from '@/config/consts';
import { callApi, handleError } from 'shared/utils';
import StatFilters from '@/views/StatFilters.vue';
import { postScrapeRequest } from '@/endpoints/core';

// Headers configuration mapping your API keys to readable labels
const headers = STAT_COLUMNS.map(col => ({ ...col, title: col.name + (col.abbreviation ? ` (${col.abbreviation})` : '') }));
const defaultSort = [{
  key: 'CA',
  order: 'desc',
}];

const loaders = ref({
  scrape: 0,
});
const statsData = ref([]);

const filters = ref({});

const filteredStats = computed(() => {
  return statsData.value.filter((row) => Object.entries(filters.value).every(([key, values]) => {
    if (!(key in row)) return false;

    switch (typeof row[key]) {
      case 'number': {
        const [operator, num] = values;
        switch (operator) {
          case '>': return row[key] > Number(num);
          case '<': return row[key] < Number(num);
          case '>=': return row[key] >= Number(num);
          case '>=': return row[key] >= Number(num);
          case '==': return row[key] === Number(num);
          case '!=': return row[key] !== Number(num);
          default: return false;
        }
      }

      case 'string':
      default:
        return (Array.isArray(values) ? values : [values]).some(val => row[key].toLowerCase().includes(val.toLowerCase()));
    }
  }));
});

const groupedData = computed(() => {
  if (!statsData.value.length) return {};

  const targetColumns = STAT_COLUMNS.filter(col => col.groupable);

  const groups = statsData.value.reduce((acc, cur) => {
    targetColumns.forEach(({ key }) => {
      if (!(key in acc)) acc[key] = new Set();
      acc[key].add(cur[key]);
    })
    return acc;
  }, {});

  return targetColumns.reduce((acc, { key }) => {
    acc[key] = [...groups[key]].sort();
    return acc;
  }, {});
});

onMounted(async () => {
  try {
    loaders.value.scrape += 1;
    const { data } = await callApi(postScrapeRequest({ url: 'https://insidesportz.spawtz.com/Leagues/Statistics?SportId=0&VenueId=2&LeagueId=4&SeasonId=59'}));
    statsData.value = data.rows;
  } catch (err) {
    handleError('Failed to load scraped indoor statistics', err);
  } finally {
    loaders.value.scrape -= 1;
  }
});
</script>