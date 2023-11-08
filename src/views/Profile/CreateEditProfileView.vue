<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'

import Image from 'primevue/image'
import Avatar from 'primevue/Avatar'
import Button from 'primevue/Button'
import InputText from 'primevue/InputText'
import Textarea from 'primevue/Textarea'
import Dropdown from 'primevue/Dropdown'
import MultiSelect from 'primevue/multiselect'

import { DIETARY_RESTRICTIONS, FOOD_ALLERGENS } from '../../util/constants'
import { convertConstantsToDropdownOptions } from '../../util/helper'
import router from '../../router'

import { useToast, POSITION } from 'vue-toastification'

import { useUserStore } from '../../stores/user'
import { useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'

const route = useRoute()
const user = useUserStore()
const toast = useToast()
const dietaryRestrictionsOptions = convertConstantsToDropdownOptions(DIETARY_RESTRICTIONS)
const allergiesOptions = convertConstantsToDropdownOptions(FOOD_ALLERGENS)

const profile = ref({
  avatarUrl: null,
  username: '',
  handle: '',
  description: '',
  dietaryRestrictions: '',
  allergies: [],
  locationName: '',
  locationDescription: ''
})

const isLoading = ref(false)
const selectedFile = ref(null)
const fileUploadRef = ref()
const formatedFileName = ref(null)

onMounted(() => {
  if (route.name === 'Edit Profile') {
    getProfileData()
  }
})

const getProfileData = async () => {
  const { data, error } = await supabase
    .from('userProfiles')
    .select('*')
    .match({ id: user.currentUser.id })
    .single()

  // : avatarUrl = item.avatarUrl

  if (error) {
    console.log('error: ', error)
    // handle the error
  } else {
    console.log('getProfileData: ', data)

    profile.value = {
      avatarUrl: data.avatarUrl,
      username: data.username,
      handle: data.handle,
      description: data.description,
      dietaryRestrictions: data.dietaryRestrictions,
      allergies: data.allergies,
      locationName: data.locationName,
      locationDescription: data.locationDescription
    }
  }
}

const getInitials = computed(() => {
  const username = profile.value.username // Access the username property from the ref object

  if (username === '') return ''

  return username.charAt(0).toUpperCase() // Use charAt(0) to get the first character
})

const preventAtKey = (event) => {
  if (event.key === '@') {
    event.preventDefault()
  }
}

const handleFileChanged = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const fileName = file.name.split('.')[0]
  const fileFormat = file.name.split('.')[1] // file format: .jpg/.jpeg/.png
  formatedFileName.value = `${
    user.currentUser.id
  }_${fileName}_${new Date().getTime()}.${fileFormat}`

  const { data: imageUploadResponse, error: imageUploadError } = await supabase.storage
    .from('avatars')
    .upload(formatedFileName.value, file, {
      contentType: 'auto' // Automatically detect content type
    })

  if (imageUploadError) {
    console.error('Image upload error:', imageUploadError)
    toast.error('Unable to upload avatar image', {
      position: POSITION.TOP_CENTER,
      timeout: 5000
    })
    return
  }

  const { data: bucketFile } = supabase.storage
    .from('avatars')
    .getPublicUrl(imageUploadResponse.path)

  profile.value.avatarUrl = bucketFile.publicUrl
}

const handleRemoveFile = async () => {
  const { data: imageDeleteResponse, error: imageDeleteError } = await supabase.storage
    .from('avatars')
    .remove([formatedFileName.value])

  if (imageDeleteError) {
    console.error('Image delete error:', imageDeleteError)
    toast.error('Unable to remove avatar image', {
      position: POSITION.TOP_CENTER,
      timeout: 5000
    })
    return
  }

  profile.value.avatarUrl = null
  fileUploadRef.value.value = ''
  selectedFile.value = null
  formatedFileName.value = null
}

const handleCreateProfile = async () => {
  console.log('profile created')
  isLoading.value = true

  const { error } = await supabase.from('userProfiles').insert({
    id: user.currentUser.id,
    avatarUrl: profile.value.avatarUrl,
    username: profile.value.username,
    handle: profile.value.handle,
    description: profile.value.description,
    dietaryRestrictions: profile.value.dietaryRestrictions,
    allergies: profile.value.allergies,
    locationName: profile.value.locationName,
    locationDescription: profile.value.locationDescription
  })

  if (error) {
    console.log('create profile: ', error)
    toast.error(error.message, {
      position: POSITION.TOP_CENTER,
      timeout: 2000
    })
    isLoading.value = false
    user.profile.username = profile.value.username
    return
  }

  user.profile = await user.fetchUserProfile()

  router.push({ name: 'Giveaways' })

  toast.success('Your profile has been created successfully!', {
    position: POSITION.TOP_CENTER,
    timeout: 5000
  })

  isLoading.value = false
}

const handleEditProfile = async () => {
  isLoading.value = true

  const { data, error } = await supabase.from('userProfiles').upsert(
    [
      {
        id: user.currentUser.id,
        avatarUrl: profile.value.avatarUrl,
        username: profile.value.username,
        handle: profile.value.handle,
        description: profile.value.description,
        dietaryRestrictions: profile.value.dietaryRestrictions,
        allergies: profile.value.allergies,
        locationName: profile.value.locationName,
        locationDescription: profile.value.locationDescription
      }
    ]
    // { onConflict: ['poster_id', 'listingID'] } // Specify how to handle conflicts
  )

  if (error) {
    console.log('editGiveaway error: ', error)
    toast.error('Edited Profile unsuccessful', {
      position: POSITION.TOP_CENTER
    })
    isLoading.value = false
  } else {
    user.profile.username = profile.value.username
    router.push({ name: 'Profile' })
    toast.success('Edited Profile successfully', {
      position: POSITION.TOP_CENTER,
      timeout: 5000
    })
  }

  isLoading.value = false
}
const handleBackBtn = () => {
  router.go(-1)
}
</script>

<template>
  <main>
    <div class="container container-create-profile">
      <div class="container-basic-information">
        <h2 class="grid-header">
          <!-- <i class="pi pi-user" style="font-size: 1.5rem"></i> -->
          Basic Information
        </h2>
        <!-- Avatar Url -->
        <!-- <Avatar
          v-if="profile.avatarUrl !== null"
          :image="profile.avatarUrl"
          class="profile-photo"
          shape="circle"
        /> -->
        <Image
          v-if="profile.avatarUrl !== null"
          :src="profile.avatarUrl"
          alt="Image"
          class="grid-avatar profile-photo profile-photo-image"
          preview
        />
        <template v-else>
          <Avatar v-if="profile.username !== ''" class="profile-avatar grid-avatar" shape="circle">
            <span>{{ getInitials }}</span>
          </Avatar>
          <Avatar v-else class="profile-avatar grid-avatar" shape="circle">
            <i class="pi pi-user"></i>
          </Avatar>
        </template>

        <div class="grid-upload">
          <input
            type="file"
            style="display: none"
            ref="fileUploadRef"
            @change="handleFileChanged($event)"
            accept="image/*"
            capture
          />
          <Button
            icon="pi pi-camera"
            label="Choose Photo"
            severity="warning"
            size="small"
            rounded
            outlined
            @click="fileUploadRef.click()"
          />
          <Button
            v-if="profile.avatarUrl !== null"
            icon="pi pi-times"
            label="Remove Photo"
            severity="danger"
            size="small"
            rounded
            outlined
            @click="handleRemoveFile"
          />
        </div>

        <span class="p-float-label grid-username">
          <InputText v-model="profile.username" class="w-full" />
          <label>Username</label>
        </span>

        <div class="p-inputgroup flex-1 grid-handle">
          <span class="p-inputgroup-addon">@</span>
          <span class="p-float-label">
            <InputText @keydown="preventAtKey" v-model="profile.handle" class="w-full" />
            <label>Handle</label>
          </span>
        </div>

        <span class="p-float-label grid-description">
          <Textarea v-model="profile.description" autoResize rows="5" cols="30" class="w-full" />
          <label>Description</label>
        </span>
      </div>

      <div class="container-dietary-restrictions w-full">
        <h2>Dietary Restrictions</h2>
        <!-- dietary restrictions - dropdown -->
        <div class="p-float-label">
          <Dropdown
            v-model="profile.dietaryRestrictions"
            :options="dietaryRestrictionsOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />

          <label for="dd-city">Select a diet</label>
        </div>

        <!-- food allergies - multiselect - chips -->
        <span class="p-float-label">
          <MultiSelect
            display="chip"
            v-model="profile.allergies"
            :options="allergiesOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
          <label>Food Allergies</label>
        </span>
      </div>

      <div class="container-location-address">
        <h2>Location Address</h2>
        <!-- location name - InputText -->
        <span class="p-float-label">
          <InputText v-model="profile.locationName" class="w-full" />
          <label>Location Name</label>
        </span>

        <!-- location description - TextArea -->
        <span class="p-float-label">
          <Textarea
            v-model="profile.locationDescription"
            autoResize
            rows="5"
            cols="30"
            class="w-full"
          />
          <label>Lcation Description</label>
        </span>
      </div>

      <div class="btn-container">
        <Button @click="handleBackBtn" label="Cancel" severity="warning" outlined rounded />
        <Button
          v-if="route.name === 'Create Profile'"
          @click="handleCreateProfile"
          :disabled="isLoading"
          label="Create Profile"
          severity="warning"
          rounded
        />
        <Button
          v-if="route.name === 'Edit Profile'"
          @click="handleEditProfile"
          :disabled="isLoading"
          label="Edit Profile"
          severity="warning"
          rounded
        />
      </div>

      <!-- <Stepper>
        <StepperPanel title="Basic Information">
          <div class="container-basic-information">
            <span class="p-float-label">
              <InputText v-model="basicInformation.name" class="w-full" />
              <label>Name</label>
            </span>

            <span class="p-float-label">
              <InputText v-model="basicInformation.handle" class="w-full" />
              <label>Handle</label>
            </span>

            <span class="p-float-label">
              <Textarea
                v-model="basicInformation.description"
                autoResize
                rows="5"
                cols="30"
                class="w-full"
              />
              <label>Description</label>
            </span>
          </div>

          <StepperFooter position="right">
            <Button label="Next" rounded @click="validateBasicInformation" />
          </StepperFooter>
        </StepperPanel>

        <StepperPanel title="Dietary Restrictions">
          <div class="container-dietary-restrictions">
            <p>Dietary Restrictions</p>
          </div>
          <StepperFooter position="right">
            <Button label="Back" rounded outlined />
            <Button label="Next" rounded />
          </StepperFooter>
        </StepperPanel>

        <StepperPanel title="Location Address">
          <div class="container-location-address">
            <p>Location Address</p>
          </div>
          <StepperFooter position="right">
            <Button label="Back" rounded outlined />
            <Button label="Create Profile" rounded />
          </StepperFooter>
        </StepperPanel>
      </Stepper> -->
    </div>
  </main>
</template>

<style>
.container-create-profile {
  display: grid;
  /* justify-content: center; */
  margin-bottom: 40px;
  max-width: 650px;
  /* border: solid; */
  padding: 0 20px;
}

.container-basic-information,
.container-dietary-restrictions,
.container-location-address {
  display: grid;
  gap: 40px;
  margin-bottom: 40px;
  /* min-width: 650px; */
  width: 100%;
}

.container-basic-information {
  grid-template-areas:
    'grid-header      grid-header'
    'grid-avatar      grid-avatar'
    'grid-upload      grid-upload'
    'grid-username    grid-handle'
    'grid-description grid-description';
}

h2 {
  color: var(--color-primary);
}

.grid-header {
  grid-area: grid-header;
  display: flex;
  align-items: center;
  gap: 15px;
}
.grid-avatar {
  grid-area: grid-avatar;
}
.grid-upload {
  grid-area: grid-upload;
  width: fit-content;
  margin: auto;
  display: flex;
  align-items: center;
  gap: 15px;
}
.grid-username {
  grid-area: grid-username;
}
.grid-handle {
  grid-area: grid-handle;
}
.grid-description {
  grid-area: grid-description;
}

.profile-avatar {
  margin-left: auto;
  margin-right: auto;
  width: 200px;
  height: 200px;
}

.profile-avatar > i,
.profile-avatar > span {
  font-size: 6rem;
}

.profile-photo-image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  margin: auto;
}
.profile-photo-image > img {
  width: 200px;
  height: 200px;
  object-fit: cover;
}

.btn-container {
  width: 100%;
  display: flex;
  justify-content: right;
  gap: 15px;
}

@media screen and (max-width: 768px) {
  .container-basic-information {
    grid-template-areas:
      'grid-header'
      'grid-avatar'
      'grid-upload'
      'grid-username'
      'grid-handle'
      'grid-description';
  }
}
</style>
