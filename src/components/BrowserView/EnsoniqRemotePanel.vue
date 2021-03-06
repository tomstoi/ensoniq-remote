<template>
  <v-container fluid class="pa-0">
    <v-row>
      <v-col cols="12" class="px-3 py-0 mb-1 text-no-wrap">
        <font color="grey" class="caption">Instruments loaded in Ensoniq:</font>
      </v-col>
    </v-row>
    <v-row
      class="flex-nowrap pl-3"
    >
      <v-col
        v-for="index in 8"
        :key="index + 1"
        class="pa-0 pr-2 mb-2"
      >
        <v-menu offset-y transition="slide-y-transition" bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              small
              block
              width="100"
              :disabled="progress"
              :outlined="getButtonMode(index)"
              :color="getButtonColor(index)"
              v-on="getButtonMenuMode(index) ? null : on"
              @click="instrumentButtonClicked(index)"
              @mousedown.right="instrumentButtonRightClicked(index, $event)"
              @mouseup.right="instrumentButtonRightClicked(index, $event)"
            >
              <font size="1px" :color="getNameColor(index)">
                {{ getName(index) }}
              </font>
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item
              v-for="(item, menuIndex) in menuItems"
              :key="menuIndex"
              @click="menuItemClicked(item.title)"
            >
              <v-list-item-title>
                <v-icon small>{{ item.icon }}</v-icon>
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
      <v-col cols="1" class="px-3 py-0">
        <v-btn
          :loading="progress"
          small
          icon
          @click="getDeviceLoadedInstruments"
        >
          <v-icon>mdi-sync</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { DataSource } from '@/utils/datasource'
import { Error } from '@/utils/error'

export default {
  name: 'EnsoniqRemotePanel',
  data () {
    return {
      progress: false,
      selectMode: false,
      sourceButtonIndex: 4,
      menuItems: [
        { title: 'COPY', icon: 'mdi-content-copy' },
        { title: 'DELETE', icon: 'mdi-delete' }
      ],
      noteValue: 0
    }
  },
  computed: {
    ...mapState('app', [
      'deviceLoadedInstruments'])
  },
  methods: {
    getDeviceLoadedInstruments () {
      this.selectMode = false
      this.progress = true
      DataSource.getAllInstrumentData()
        .then(() => {
          this.progress = false
        })
        .catch(err => {
          console.error('Error fetching instrument data:' + err)
          this.progress = false
          Error.show('No Ensoniq device found!')
          DataSource.clearAllInstrumentData()
        })
    },

    getName (index) {
      const name = this.deviceLoadedInstruments[index - 1]
      return name === null ? '<none>' : name
    },

    getNameColor (index) {
      const name = this.deviceLoadedInstruments[index - 1]
      if (name === null) return this.selectMode ? 'grey' : ''
      return 'white'
    },

    getButtonColor (index) {
      return this.deviceLoadedInstruments[index - 1] === null
        ? 'grey darken-3'
        : 'grey darken-1'
    },

    getButtonMode (index) {
      return !(this.selectMode && index !== this.sourceButtonIndex)
    },

    getButtonMenuMode (index) {
      return (
        this.deviceLoadedInstruments[index - 1] === null || this.selectMode // No menu for empty instruments or...
      ) // ... when copying
    },

    instrumentButtonClicked (pos) {
      console.log(pos)
      if (this.selectMode) {
        // Clicking source button will cancel the copy
        if (pos === this.sourceButtonIndex) {
          this.selectMode = false
          return
        }
        this.selectMode = false
        this.progress = true
        DataSource.copyInstrument(this.sourceButtonIndex, pos).then(() => {
          this.progress = false
        })
        return
      }
      this.sourceButtonIndex = pos
    },

    instrumentButtonRightClicked (pos, e) {
      console.warn(e)
      console.warn('RIGHT:' + pos)
      if (e.type === 'mousedown') {
        let relativeX = 0
        if (e.target.nodeName === 'BUTTON') {
          relativeX =
            1 -
            (e.target.offsetLeft + e.target.offsetWidth - e.clientX) /
              e.target.offsetWidth
        }

        if (e.target.nodeName === 'DIV') {
          relativeX =
            1 -
            (e.target.parentElement.offsetLeft +
              e.target.parentElement.offsetWidth -
              e.clientX) /
              e.target.parentElement.offsetWidth
        }

        if (e.target.nodeName === 'FONT') {
          relativeX =
            1 -
            (e.target.parentElement.parentElement.offsetLeft +
              e.target.parentElement.parentElement.offsetWidth -
              e.clientX) /
              e.target.parentElement.parentElement.offsetWidth
        }

        console.log('hit button - pos:' + relativeX)
        this.noteValue = Math.round((relativeX * 0.5 + 0.25) * 0x7f)
      }

      DataSource.playInstrument(
        pos,
        this.noteValue,
        e.type === 'mousedown' ? 0x7f : 0x00
      )
    },

    menuItemClicked (title) {
      console.log(title)
      if (title === 'COPY') {
        this.selectMode = true
      }
      if (title === 'DELETE') {
        this.progress = true
        DataSource.deleteInstrument(this.sourceButtonIndex).then(() => {
          this.progress = false
        })
      }
    }
  },
  mounted () {
    DataSource.initialize()
      .then(() => this.getDeviceLoadedInstruments())
  }
}
</script>

<style></style>
