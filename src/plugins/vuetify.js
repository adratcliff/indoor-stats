import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify'

export default createVuetify({
  defaults: {
    VChip: {
      variant: 'flat',
      size: 'small',
      hideDetails: true,
    },
    VTextField: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: true,
    },
    VTextarea: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: true,
    },
    VCombobox: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: true,
    },
    VSelect: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: true,
    },
  },
})