<template>
  <v-card class="px-4" variant="flat">
    <div
      class="text-subtitle-1 font-weight-bold d-flex align-center justify-space-between"
      :class="{
        'mb-3': activeFilters.length
      }">
      <div class="d-flex align-center">
        <v-icon icon="mdi-filter-variant" class="me-2" />
        <span v-if="activeFilters.length">{{ activeFilters.length }} Active Filters</span>
        <span v-else>No Active Filters</span>
      </div>

      <div>
        <v-btn
          v-if="activeFilters.length"
          color="error"
          variant="text"
          size="small"
          class="me-2"
          text="Clear All Filters"
          @click="clearAllFilters" />

        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          variant="elevated"
          text="Add Filter"
          size="small"
          @click="addNewFilterRow" />
      </div>
    </div>

    <v-row
      v-for="(filter, index) in activeFilters"
      :key="index"
      class="align-center mb-2"
      density="compact">

      <v-col cols="12" sm="3">
        <v-select
          v-model="filter.column"
          :items="availableColumns"
          item-title="label"
          item-value="key"
          label="Select Field"
          density="compact"
          @update:model-value="handleColumnChange(index)" />
      </v-col>

      <v-col cols="12" sm="8" class="d-flex align-center gap-2">

        <template v-if="getColumnType(filter.column) === 'number'">
          <v-select
            v-model="filter.operator"
            :items="OPERATORS"
            label="Op" />
          <v-text-field
            v-model.number="filter.value"
            type="number"
            label="Value"
            class="flex-grow-1" />
        </template>

        <template v-else-if="filter.column in props.groups">
          <v-combobox
            v-model="filter.value"
            :items="props.groups[filter.column]"
            label="Select or type values"
            class="flex-grow-1"
            multiple
            chips />
        </template>

        <template v-else>
          <v-text-field
            v-model="filter.value"
            :label="`Search ${filter.column}s...`"
            class="flex-grow-1"
          />
        </template>
      </v-col>

      <v-col cols="12" sm="1" class="text-right">
        <v-btn
          icon="mdi-delete-outline"
          variant="text"
          color="error"
          size="sm"
          class="pa-2"
          @click="removeFilterRow(index)" />
      </v-col>
    </v-row>

  </v-card>
</template>

<script setup>
import { defineEmits, defineProps, ref, toRefs, watch } from 'vue'
import { STAT_COLUMNS, OPERATORS } from '@/config/consts'

const props = defineProps({
  groups: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update'])

const availableColumns = STAT_COLUMNS.map(col => ({ ...col, label: col.name + (col.abbreviation ? ` (${col.abbreviation})` : '') }));

const activeFilters = ref([]);

const getColumnType = (key) => {
  const found = availableColumns.find(c => c.key === key);
  return found ? found.type : 'string';
};

// UI Management Logic
const addNewFilterRow = () => {
  activeFilters.value.push({
    column: 'Player',
    operator: '>',
    value: ''
  });
};

const handleColumnChange = (index) => {
  const row = activeFilters.value[index];

  console.log(props.groups)
  if (getColumnType(row.column) === 'number') {
    row.value = null;
  } else if (row.column in props.groups) {
    row.value = [];
  } else {
    row.value = '';
  }

  row.operator = '>';
};

const removeFilterRow = (index) => {
  activeFilters.value.splice(index, 1);
};

const clearAllFilters = () => {
  activeFilters.value = [];
};

watch(
  activeFilters,
  (newRows) => {
    const parsedFilters = {};

    newRows.forEach((row) => {
      if (!row.column) return;

      const type = getColumnType(row.column);

      if (type === 'number') {
        if (row.value !== null && row.value !== '') {
          parsedFilters[row.column] = [row.operator, row.value];
        }
      } else {
        if (row.value && (Array.isArray(row.value) ? row.value.length > 0 : row.value.trim() !== '')) {
          parsedFilters[row.column] = Array.isArray(row.value) ? row.value : [row.value];
        }
      }
    })

    emit('update', parsedFilters);;
  },
  { deep: true },
);
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>