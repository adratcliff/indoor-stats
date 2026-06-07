<template>
  <v-card flat title="Player Statistics">
    <template #text>
      <stat-filters
        :groups="groupedData"
        @update="filters = $event" />
    </template>
    <v-data-table
      v-model="selectedRows"
      :headers="headers"
      :items="filteredStats"
      :loading="!!loaders.scrape"
      :sort-by="defaultSort"
      :show-select="selectMode"
      class="elevation-1 aligned-expansion-table"
      item-value="id"
      show-expand
      hover>
      <template #header.data-table-expand>
        <v-btn
          :color="selectMode ? 'success' : ''"
          :icon="selectMode ? 'mdi-checkbox-multiple-marked-outline' : 'mdi-checkbox-multiple-blank-outline'"
          size="small"
          variant="elevated"
          @click="handleSelectionActionButton" />
      </template>
      <template #item.data-table-expand="{ item, internalItem, toggleExpand, isExpanded }">
        <v-btn
          v-if="item.segments && item.segments.length"
          :icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          variant="text"
          density="comfortable"
          @click="toggleExpand(internalItem)" />
      </template>

      <template #item.Player="{ value, item }">
        <span :class="{ 'text-blue font-weight-bold': item.segments }">
          {{ value }}
        </span>
      </template>
      <template #item.C="{ value }">
        <span :class="value < 0 ? 'text-red font-weight-bold' : 'text-green'">{{ value }}</span>
      </template>
      <template #item.CA="{ value }">
        <span :class="value < 0 ? 'text-red font-weight-bold' : 'text-green'">{{ value }}</span>
      </template>

      <template #expanded-row="{ item, columns }">
        <tr v-for="subRow in item.segments" :key="subRow.id">
          <td
            v-for="column in columns"
            :key="`sub-${subRow.id}-${column.key}`"
            :class="[
              'themed-sub-cell',
              column.align === 'end' ? 'text-end' : 'text-start',
            ]">
            <template v-if="column.key === 'data-table-select'"></template>
            <template v-else-if="column.key === 'data-table-expand'"></template>
            <template v-else>
              <span v-if="column.key === 'Player'" class="font-italic text-grey-darken-1 pl-2">
                <span class="mdi mdi-subdirectory-arrow-right" />
                {{ subRow[column.key] }}
              </span>
              <span
                v-else
                :class="{
                  'text-green': subRow[column.key] > 0 && ['C', 'CA'].includes(column.key),
                  'text-red font-weight-bold': subRow[column.key] < 0 && ['C', 'CA'].includes(column.key),
                  'text-grey-darken-1': !['C', 'CA'].includes(column.key)
                }">
                {{ subRow[column.key] }}
              </span>
            </template>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { STAT_COLUMNS } from '@/config/consts';
import { postScrapeRequest } from '@/endpoints/core';
import { callApi, handleError, randomHex, round, sumProperty } from 'shared/utils';
import StatFilters from '@/views/StatFilters.vue';

const headers = [
  ...STAT_COLUMNS.map(col => ({ ...col, title: col.name + (col.abbreviation ? ` (${col.abbreviation})` : '') })),
  { title: '', key: 'data-table-expand', sortable: false },
];

const defaultSort = [{
  key: 'CA',
  order: 'desc',
}];

const loaders = ref({
  scrape: 0,
});

const statsData = ref([]);
const statGroupings = ref({});

const filters = ref({});

const mappedStats = computed(() => statsData.value.map((row) => ({ ...row, id: `${row.Player}-${row.Team}-${row.Division}` })));

const groupedStats = computed(() => mappedStats.value.reduce((acc, cur) => {
  if (!(cur.id in statGroupings.value)) {
    acc.push(cur);
    return acc;
  }

  let targetGroup = acc.find(target => target.id === statGroupings.value[cur.id]);

  if (!targetGroup) {
    acc.push({
      ...cur,
      id: statGroupings.value[cur.id],
      segments: [cur],
    });
    return acc;
  }

  targetGroup.segments.push(cur);
  Object.entries(cur).forEach(([key, val]) => {
    if (key === 'id') return;
    switch (typeof val) {
      case 'string':
        if (targetGroup[key].includes(val)) break;
        targetGroup[key] += ', ' + val;
        break;
      case 'number':
        targetGroup[key] += val;
        break;
      default:
        console.warn('Unsupported value type');
    }
  });

  // Average values need custom combination logic
  const games = sumProperty(targetGroup.segments, 'G');
  const averageKeys = ['RA', 'SR', 'WA', 'RCA', 'CA'];
  averageKeys.forEach(key => {
    const subKey = key.endsWith('A') ? key.slice(0, -1) : key;
    targetGroup[key] = round(sumProperty(targetGroup.segments, subKey) / games, 3);
  });

  return acc;
}, []));

const filteredStats = computed(() => {
  return groupedStats.value.filter((row) => Object.entries(filters.value).every(([key, values]) => {
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

const selectMode = ref(false);
const selectedRows = ref([]);

const handleSelectionActionButton = () => {
  if (!selectMode.value) {
    selectMode.value = true;
    return;
  }

  if (selectMode.value && selectedRows.value.length === 0) {
    selectMode.value = false;
    return;
  }

  executeBatchAction(selectedRows.value);
};

const executeBatchAction = () => {
  const newGroupId = randomHex(6);

  selectedRows.value.forEach(row => {
    statGroupings.value[row] = newGroupId;
  });

  selectedRows.value = [];
  selectMode.value = false;
};

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

<style scoped>
:deep(.aligned-expansion-table tbody tr.sub-row-alignment) {
  display: contents !important;
}

.themed-sub-cell {
  background-color: rgba(var(--v-theme-on-surface), 0.04) !important;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08) !important;
}

.themed-sub-cell :deep(span) {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
</style>