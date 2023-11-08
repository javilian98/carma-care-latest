<script setup>
import { defineProps } from 'vue'
import { useRoute } from 'vue-router'
import Avatar from 'primevue/avatar/Avatar.vue'
import 'primeicons/primeicons.css'
import Tag from 'primevue/tag/Tag.vue'
import PlaceholderImg from '@/assets/images/placeholder-image.png'

const props = defineProps({
  listingID: String,
  listingType: String,
  username: String,
  avatarUrl: String,
  postingTime: String,
  locationAddress: String,
  category: String,
  image: String,
  listingTitle: String,
  tags: Array,
  status: String,
  quantityNum: Number,
  isPoster: Boolean
})

const route = useRoute()

// Calculate the time difference in milliseconds
const timeDifference = Date.now() - Date.parse(props.postingTime)

// Calculate the time difference in different units
const seconds = timeDifference / 1000
const minutes = seconds / 60
const hours = minutes / 60
const days = hours / 24
var timeDiff = 'now'
if (days > 1) {
  if (days.toFixed(0) == 1) {
    timeDiff = days.toFixed(0) + 'd ago'
  } else {
    timeDiff = days.toFixed(0) + 'd ago'
  }
} else if (hours > 1) {
  if (hours.toFixed(0) == 1) {
    timeDiff = hours.toFixed(0) + 'h ago'
  } else {
    timeDiff = hours.toFixed(0) + 'h ago'
  }
} else if (minutes > 1) {
  if (minutes.toFixed(0) == 1) {
    timeDiff = minutes.toFixed(0) + 'min ago'
  } else {
    timeDiff = minutes.toFixed(0) + 'min ago'
  }
} else if (seconds > 1) {
  if (seconds.toFixed(0) == 1) {
    timeDiff = seconds.toFixed(0) + 'sec ago'
  } else {
    timeDiff = seconds.toFixed(0) + 'sec ago'
  }
}

const statusSeverity = (status) => {
  switch (status) {
    case 'available':
      return 'success'
    case 'In Transaction':
      return 'warning'
    default:
      return 'danger'
  }
}
</script>

<template>
  <router-link :to="{ path: `/${listingType.toLowerCase()}s/${listingID}` }">
    <div class="listings-card">
      <div class="card-header">
        <div class="card-header-avatar">
          <!-- card header avatar goes in here -->
          <Avatar
            v-if="avatarUrl != null"
            id="avatar"
            class="mr-2"
            size="large"
            shape="circle"
            :image="avatarUrl"
          />
          <Avatar
            v-else
            id="avatar"
            class="mr-2"
            size="large"
            shape="circle"
            :label="username?.[0].toUpperCase()"
            style="background-color: #d2d2d2"
          />
        </div>

        <div class="card-header-content">
          <div class="card-header-top">
            <span class="card-header-name">
              <!-- card header name goes in here -->
              {{ username }}
            </span>
            <div
              v-if="isPoster && route.name !== 'Create Giveaway' && route.name !== 'Create Request'"
              class="card-header-edit-btn"
            >
              <!-- card header edit button goes in here -->
              <router-link :to="{ path: `/${listingType.toLowerCase()}s/edit/${listingID}` }">
                <i class="pi pi-file-edit" style="font-size: larger; margin-right: 2px"></i>
              </router-link>
            </div>
          </div>

          <div class="card-header-bottom">
            <span class="card-header-time">
              <!-- card header time goes in here -->
              {{ timeDiff }}
            </span>
            <span class="card-header-location-container">
              <span class="card-header-location">
                <!-- card header location goes in here -->
                <i class="pi pi-map-marker"></i>
                {{ locationAddress !== '' ? locationAddress : 'location' }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div class="card-image-container">
        <div class="card-image-item-tag">
          <!-- card image tag goes in here -->
          <Tag
            v-if="category == 'Food'"
            id="tag"
            :value="category"
            style="
              margin: 2px, 0, 0, 5px;
              border: solid 1px black;
              color: orange;
              font-weight: 500;
              letter-spacing: 0.5px;
              background-color: white;
            "
          ></Tag>
          <Tag
            v-if="category == 'Tuition'"
            id="tag"
            :value="category"
            style="
              margin: 2px, 0, 0, 5px;
              border: solid 1px black;
              color: #6aef42;
              font-weight: 500;
              letter-spacing: 0.5px;
              background-color: white;
            "
          ></Tag>
          <Tag
            v-if="category == 'Apparel'"
            id="tag"
            :value="category"
            style="
              margin: 2px, 0, 0, 5px;
              border: solid 1px black;
              color: #679af1;
              font-weight: 500;
              letter-spacing: 0.5px;
              background-color: white;
            "
          ></Tag>
        </div>
        <img v-if="image" class="card-image" :src="image" alt="" />
        <img
          v-else
          class="card-image"
          style="height: unset; padding: 70px"
          :src="PlaceholderImg"
          alt=""
        />
      </div>

      <div class="card-content">
        <div v-if="listingTitle" class="card-content-title">
          <!-- card title goes in here -->
          {{ listingTitle }}
        </div>
        <div v-else class="card-content-title">
          <!-- card title goes in here -->
          <!-- {{ listingTitle }} -->
          <div class="placeholder-card-content-title">Sample Title</div>
        </div>
        <div v-if="tags.length > 0" class="card-content-tags">
          <!-- card tags goes in here -->
          <Tag v-for="(item, index) in tags" :key="index" severity="warning" class="category"
            ><span class="card-content-tags-text">{{ item }}</span></Tag
          >
        </div>
        <div v-else class="card-content-tags">
          <!-- card tags goes in here -->
          <Tag
            v-for="(n, index) in 2"
            :key="index"
            severity="warning"
            class="category"
            :style="
              route.name === 'Giveaways' || route.name === 'Requests'
                ? { visibility: 'hidden' }
                : {}
            "
            ><span class="card-content-tags-text">Tag {{ index + 1 }}</span>
          </Tag>
        </div>
      </div>

      <div class="card-footer">
        <!-- card item status goes in here -->
        <Tag v-if="status == ''" value="Status"></Tag>
        <Tag v-else-if="status == 'Available'" severity="success" :value="status"></Tag>
        <Tag v-else :severity="statusSeverity(status)" :value="status"></Tag>

        <div class="card-item-servings" v-if="category == 'Food'">
          <!-- card item servings goes in here -->
          <i class="pi pi-user"></i>
          {{ quantityNum }} servings
        </div>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
a {
  text-decoration: none;
  color: #495057;
  /* border: solid 1px red; */
}
.listings-card {
  /* max-width: 350px; */
  width: 100%;
  min-height: 450px;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 7px 30px rgba(0, 0, 0, 0.1);
}

#avatar {
  border-radius: 100%;
  margin: 5px 10px 5px 10px;
  display: flex;
  background-color: white;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 5px 0px;
}

.card-header-time {
  white-space: nowrap;
}

.card-header-content {
  width: 100%;
  overflow: hidden;
}

.card-header-top {
  display: flex;
  justify-content: space-between;
}

.card-header-edit-btn {
  display: flex;
}
.card-header-edit-btn a {
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-header-edit-btn i::before {
  color: var(--color-primary);
}

.card-header-bottom {
  color: #a3a3a3;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  /* width: 230.5px; */
  /* height: 25px; */
  font-size: 0.85em;
}

.card-header-location-container {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.card-header-location {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-header-location i::before {
  color: var(--color-primary);
}

.card-header-content {
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 10px;
}

.card-image-container {
  height: 250px;
  overflow: hidden;
  position: relative;
}
.card-image-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(#000, #00000000);
  height: 30%;
  opacity: 0.15;
  z-index: 1;
}
.card-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.card-image > .p-image {
  width: 100%;
}

.card-image-item-tag {
  position: relative;
  z-index: 1;
}

#tag {
  position: absolute;
  top: 10px;
  left: 10px;

  padding: 5px;
  font-weight: 500;
  background-color: white;
  box-shadow: 0 7px 15px rgba(0, 0, 0, 0.1);
  border: solid 1px transparent !important;
}
#tag span {
  font-weight: 500 !important;
}

.card-content {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-content-title {
  font-weight: 500;
  font-size: 1.1em;
  color: #333;
}

.card-content-tags {
  gap: 8px;
  display: flex;
  height: 26px;
}

.card-content-tags-text {
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  padding-bottom: 15px;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
}

.card-item-servings i {
  padding-right: 6px;
}
</style>
