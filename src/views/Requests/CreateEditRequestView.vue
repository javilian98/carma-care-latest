<script setup>
/* eslint-disable no-undef */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '../../router'
import { useMatchMedia, screenSize } from '../../composables/useMatchMedia'

import ListingsCard from '../../components/Listings/ListingsCard.vue'
import CardContainer from '../../components/CardContainer/CardContainer.vue'
import MultipleImageUpload from '../../components/MultipleImageUpload.vue'

import Dialog from 'primevue/dialog/Dialog.vue'
import Button from 'primevue/button/Button.vue'
import InputText from 'primevue/inputtext/InputText.vue'
import Dropdown from 'primevue/dropdown/Dropdown.vue'
import MultiSelect from 'primevue/multiselect/MultiSelect.vue'
import Textarea from 'primevue/textarea/Textarea.vue'
import Chips from 'primevue/chips/Chips.vue'

import { supabase } from '../../lib/supabase'

import {
  LISTING_TYPE,
  DIETARY_RESTRICTIONS,
  FOOD_ALLERGENS,
  STATUS,
  SERVING_SIZE,
  CATEGORY
} from '../../util/constants'

import { convertConstantsToDropdownOptions } from '../../util/helper'

// vue-toastification
import { useToast, POSITION } from 'vue-toastification'

import { useUserStore } from '../../stores/user'

import { isValueEmpty, checkEmptyFormInputs } from '../../util/helper'

import VueGoogleAutocomplete from 'vue-google-autocomplete'

const route = useRoute()
const toast = useToast()
const user = useUserStore()

const isLoading = ref(false)
const imageFiles = ref([])
const showPreview = ref(false)
const googleAutocompleteRef = ref(null)

const formInit = {
  posterID: user.currentUser.id,
  username: user.profile?.username,
  listingType: LISTING_TYPE.Request, // (LISTING_TYPE.Request for CreateEditRequestView.vue)
  listingTitle: '',
  status: '',
  category: '',
  dietaryRestrictions: '',
  foodAllergens: [],
  tags: [],
  description: '',
  images: [],
  quantityNum: '',
  locationAddress: '',
  locationDescription: '',
  locationCoords: ''
}
const form = ref(formInit)
const formErrors = ref({})

onMounted(async () => {
  user.profile = await user.fetchUserProfile()

  if (route.name === 'Edit Request') {
    getRequestData()
  }
})

const statusOptions = convertConstantsToDropdownOptions(STATUS)
const allergensOptions = convertConstantsToDropdownOptions(FOOD_ALLERGENS)
const dietaryRestrictionsOptions = convertConstantsToDropdownOptions(DIETARY_RESTRICTIONS)
const servingsizeOptions = convertConstantsToDropdownOptions(SERVING_SIZE)
const categoryOptions = convertConstantsToDropdownOptions(CATEGORY)

const getRequestData = async () => {
  const { data, error } = await supabase
    .from('listings')
    .select(
      'poster_id,listingID,listingType, postingTime, listingDesc, locationDesc, locationAddress, category, dietaryRestrictions, allergens, images, listingTitle, tags,status, quantityNum, userProfiles(username, avatarUrl)'
    )
    .match({ listingID: route.params.id, poster_id: user.currentUser.id })
    .single()

  // : avatarUrl = item.avatarUrl

  if (error) {
    console.log('error: ', error)
    // handle the error
  } else {
    // do something with the data (e.g. assign data to an array ref)
    // queryData.value = data
    console.log('form.valueee:: ', form.value)
    form.value = {
      posterID: data.poster_id,
      username: data.userProfiles.username,
      listingType: data.listingType, // (LISTING_TYPE.Request for CreateEditRequestView.vue)
      listingTitle: data.listingTitle,
      status: data.status,
      category: data.category,
      dietaryRestrictions: data.dietaryRestrictions || null,
      foodAllergens: data.allergens || [],
      tags: data.tags || [],
      description: data.listingDesc || '',
      images: data.images || [],
      quantityNum: data.quantityNum || '',
      locationAddress: data.locationAddress || '',
      locationDescription: data.locationDesc || '',
      locationCoords: data.locationCoords != undefined ? JSON.parse(data.locationCoords) : ''
    }
  }
}

const handleBackBtn = () => {
  router.go(-1)
}

const handleChangeCategoryOption = (event) => {
  if (event.value !== CATEGORY.Food) {
    form.value.quantityNum = ''
    form.value.foodAllergens = FOOD_ALLERGENS.None
    form.value.dietaryRestrictions = DIETARY_RESTRICTIONS.None
  }
}

const handleCreateRequest = async () => {
  if (checkEmptyFormInputs(form.value)) {
    Object.keys(form.value).forEach((key) => {
      console.log(
        'isValueEmpty(form.value[key], key, form.value) ',
        isValueEmpty(form.value[key], key, form.value)
      )
      formErrors.value[key] = isValueEmpty(form.value[key], key, form.value)
    })

    toast.error('Some inputs are not filled in', {
      position: POSITION.TOP_CENTER
    })
    return
  }

  isLoading.value = true
  // Upload the images to a Supabase bucket
  for (let image of imageFiles.value) {
    const imageFileFormat = image.name.split('.')[1] // file format: .jpg/.jpeg/.png
    const filename = `${user.currentUser.id}_${
      image.name
    }_${new Date().getTime()}.${imageFileFormat}`

    const { data: imageUploadResponse, error: imageUploadError } = await supabase.storage
      .from('listings')
      .upload(filename, image.file, {
        contentType: 'auto' // Automatically detect content type
      })

    if (imageUploadError) {
      console.error('Image upload error:', imageUploadError)
      continue // Skip to the next file on error
    }

    const { data: bucketFile } = supabase.storage
      .from('listings')
      .getPublicUrl(imageUploadResponse.path)

    form.value.images.push(bucketFile.publicUrl)
  }

  const { data, error } = await supabase.from('listings').insert({
    poster_id: user.currentUser.id,
    listingType: form.value.listingType,
    listingTitle: form.value.listingTitle,
    status: form.value.status,
    category: form.value.category,
    dietaryRestrictions: form.value.dietaryRestrictions,
    allergens: form.value.foodAllergens,
    tags: form.value.tags,
    listingDesc: form.value.description,
    images: form.value.images,
    quantityNum: form.value.quantityNum,
    locationAddress: form.value.locationAddress,
    locationDesc: form.value.locationDescription,
    locationCoords: JSON.stringify(form.value.locationCoords)
  })

  if (error) {
    console.log('createRequest error: ', error)
    toast.error('Created Request unsuccessful', {
      position: POSITION.TOP_CENTER
    })
    isLoading.value = false
  } else {
    // Check if user has enough carma
    if (user.profile.currBalanceCarma < 5) {
      toast.error('Cannot Create Request: Not enough Carma', {
        position: POSITION.TOP_CENTER
      })
    } else {
      // Deduct carma
      const { data, error } = await supabase
        .from('userProfiles')
        .update({
          currBalanceCarma: user.profile.currBalanceCarma - 5
        })
        .match({ id: user.profile.id })
      if (error) {
        console.log('Error updating user carma:', error.message)
        toast.error('Created Request unsuccessful', {
          position: POSITION.TOP_CENTER
        })
        isLoading.value = false
      } else {
        user.profile = await user.fetchUserProfile()

        router.push({ name: 'Requests' })
        toast.success('Created Request successfully', {
          position: POSITION.TOP_CENTER,
          timeout: 5000
        })
        form.value = formInit
      }
    }
  }

  isLoading.value = false
}

const handleEditRequest = async () => {
  if (checkEmptyFormInputs(form.value)) {
    Object.keys(form.value).forEach((key) => {
      console.log(
        'isValueEmpty(form.value[key], key, form.value) ',
        isValueEmpty(form.value[key], key, form.value)
      )
      formErrors.value[key] = isValueEmpty(form.value[key], key, form.value)
    })

    toast.error('Some inputs are not filled in', {
      position: POSITION.TOP_CENTER
    })
    return
  }

  isLoading.value = true

  const { data, error } = await supabase.from('listings').upsert(
    [
      {
        listingID: route.params.id,
        poster_id: user.currentUser.id,
        listingType: form.value.listingType,
        listingTitle: form.value.listingTitle,
        status: form.value.status,
        category: form.value.category,
        dietaryRestrictions: form.value.dietaryRestrictions,
        allergens: form.value.foodAllergens,
        tags: form.value.tags,
        listingDesc: form.value.description,
        images: form.value.images,
        quantityNum: form.value.quantityNum,
        locationAddress: form.value.locationAddress,
        locationDesc: form.value.locationDescription
      }
    ]
    // { onConflict: ['poster_id', 'listingID'] } // Specify how to handle conflicts
  )

  if (error) {
    console.log('editRequest error: ', error)
    toast.error('Edited Request unsuccessful', {
      position: POSITION.TOP_CENTER
    })
    isLoading.value = false
  } else {
    router.push({ name: 'Requests' })
    toast.success('Edited Request successfully', {
      position: POSITION.TOP_CENTER,
      timeout: 5000
    })
    form.value = formInit
  }

  isLoading.value = false
}

const handleUploadImages = (images) => {
  imageFiles.value = images.value
}

const getAddressData = (addressData, placeResultData, id) => {
  console.log('places: addressData ', addressData)
  console.log('places: placeResultData ', placeResultData)
  googleAutocompleteRef.value = placeResultData.formatted_address
  form.value.locationAddress = placeResultData.formatted_address

  const lat = placeResultData.geometry.location.lat()
  const lng = placeResultData.geometry.location.lng()
  form.value.locationCoords = { lat, lng }
}

const tabletScreen = useMatchMedia(screenSize.tablet)

const handleFocusOut = (key) => {
  formErrors.value[key] = isValueEmpty(form.value[key], key, form.value)

  console.log('formErrors.value[key] ', isValueEmpty(form.value[key]))
}
</script>

<template>
  <main>
    <div class="container container-narrow container-create-edit-request">
      <section class="preview">
        <!-- Card goes here -->
        <p class="preview-title">Preview Card</p>
        <ListingsCard
          :listingType="form.listingType"
          :username="user.profile?.username"
          :avatarUrl="user.profile?.avatarUrl"
          :postingTime="null"
          :locationAddress="form.locationAddress"
          :category="form.category"
          :image="form.images?.[0] ?? imageFiles[0]?.url"
          :listingTitle="form.listingTitle"
          :tags="form.tags"
          :status="form.status"
          :quantityNum="form.quantityNum"
          :isPoster="true"
        />
      </section>

      <section class="form-container">
        <form>
          <div class="card-container">
            <CardContainer title="Request Information">
              <div class="request-information">
                <span class="p-float-label request-name">
                  <InputText
                    v-model="form.listingTitle"
                    class="w-full"
                    @focusout="handleFocusOut('listingTitle')"
                    :class="{ 'p-invalid': formErrors['listingTitle'] }"
                  />
                  <label>Request Title</label>
                </span>

                <!-- <div class="p-float-label request-type">
                  <Dropdown
                    v-model="form.listingType"
                    :options="requestTypeOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />

                  <label>Request Type</label>
                </div> -->

                <div class="p-float-label request-category">
                  <Dropdown
                    @change="handleChangeCategoryOption"
                    v-model="form.category"
                    @focusout="handleFocusOut('category')"
                    :class="{ 'p-invalid': formErrors['category'] }"
                    :options="categoryOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />

                  <label>Request Category</label>
                </div>

                <div class="p-float-label request-status">
                  <Dropdown
                    v-model="form.status"
                    @focusout="handleFocusOut('status')"
                    :class="{ 'p-invalid': formErrors['status'] }"
                    :options="statusOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />

                  <label for="dd-city">Request Status</label>
                </div>

                <div v-if="form.category === CATEGORY.Food" class="p-float-label request-serving">
                  <Dropdown
                    v-model="form.quantityNum"
                    @focusout="handleFocusOut('quantityNum')"
                    :class="{ 'p-invalid': formErrors['quantityNum'] }"
                    :options="servingsizeOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />

                  <label>Serving Size</label>
                </div>

                <div
                  v-if="form.category === CATEGORY.Food"
                  class="p-float-label request-restrictions"
                >
                  <Dropdown
                    v-model="form.dietaryRestrictions"
                    @focusout="handleFocusOut('dietaryRestrictions')"
                    :class="{ 'p-invalid': formErrors['dietaryRestrictions'] }"
                    :options="dietaryRestrictionsOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />

                  <label>Dietary Restrictions</label>
                </div>

                <div class="card p-fluid request-tags">
                  <span class="p-float-label">
                    <Chips
                      id="chips"
                      v-model="form.tags"
                      @focusout="handleFocusOut('tags')"
                      :class="{ 'p-invalid': formErrors['tags'] }"
                    />
                    <label for="chips">Tags</label>
                  </span>
                </div>

                <div v-if="form.category === CATEGORY.Food" class="p-float-label request-allergens">
                  <MultiSelect
                    display="chip"
                    v-model="form.foodAllergens"
                    @focusout="handleFocusOut('foodAllergens')"
                    :class="{ 'p-invalid': formErrors['foodAllergens'] }"
                    :options="allergensOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />

                  <label>List of Allergens</label>
                </div>

                <span class="p-float-label request-description">
                  <Textarea
                    v-model="form.description"
                    @focusout="handleFocusOut('description')"
                    :class="{ 'p-invalid': formErrors['description'] }"
                    autoResize
                    rows="5"
                    cols="30"
                    class="w-full"
                  />
                  <label>Description</label>
                </span>
              </div>
            </CardContainer>

            <CardContainer title="Location Information">
              <div class="location-information">
                <!-- <span class="p-float-label location">
                  <InputText
                    v-model="form.locationAddress"
                    class="w-full"
                  />
                  <label>Location Address</label>
                </span> -->
                <!-- <span class="p-float-label location">
                  <InputText
                    ref="locationAddressRef"
                    v-model="form.locationAddress"
                    class="w-full"
                  />
                  <input
                    type="text"
                    ref="locationAddressRef"
                    v-model="form.locationAddress"
                    class="w-full"
                  />
                  <label>Location Address</label>
                </span> -->
                <!-- <input
                  style="
                    font-family: inherit;
                    font-feature-settings: inherit;
                    font-size: 1rem;
                    color: #495057;
                    background: #ffffff;
                    padding: 0.75rem 0.75rem;
                    border: 1px solid #ced4da;
                    border-radius: 6px;
                  "
                  type="text"
                  ref="locationAddressRef"
                  v-model="form.locationAddress"
                  class="w-full"
                /> -->
                <VueGoogleAutocomplete
                  id="map"
                  classname="form-control"
                  placeholder="Location Address"
                  ref="googleAutocompleteRef"
                  v-model="form.locationAddress"
                  v-on:placechanged="getAddressData"
                  style="
                    font-family: inherit;
                    font-feature-settings: inherit;
                    font-size: 1rem;
                    color: #495057;
                    background: #ffffff;
                    padding: 0.75rem 0.75rem;
                    border: 1px solid #ced4da;
                    border-radius: 6px;
                  "
                ></VueGoogleAutocomplete>

                <span class="p-float-label request-location-description">
                  <Textarea
                    v-model="form.locationDescription"
                    @focusout="handleFocusOut('locationDescription')"
                    :class="{ 'p-invalid': formErrors['locationDescription'] }"
                    autoResize
                    rows="5"
                    cols="30"
                    class="w-full"
                  />
                  <label>Location Description</label>
                </span>
              </div>
            </CardContainer>

            <CardContainer title="Photo Gallery">
              <div v-if="form.images.length < 1" style="color: #e24c4c; margin-bottom: 10px">
                Please upload an image
              </div>
              <div class="photo-gallery">
                <MultipleImageUpload @uploadImages="handleUploadImages" />
              </div>
            </CardContainer>
          </div>

          <div class="btn-container pt-small">
            <Button
              v-if="tabletScreen"
              icon="pi pi-eye"
              aria-label="Preview"
              rounded
              @click="showPreview = true"
            />
            <div class="next-prev-btn-container">
              <router-link to="">
                <Button
                  severity="warning"
                  icon="pi pi-times"
                  label="Cancel"
                  rounded
                  outlined
                  @click="handleBackBtn"
                />
              </router-link>
              <Button
                v-if="route.name === 'Edit Request'"
                severity="warning"
                icon="pi pi-plus"
                label="Save Changes"
                rounded
                :disabled="isLoading"
                @click="handleEditRequest"
              />
              <Button
                v-else
                severity="warning"
                icon="pi pi-plus"
                label="Create"
                rounded
                :disabled="isLoading"
                @click="handleCreateRequest"
              />
            </div>
          </div>
        </form>
      </section>
    </div>
  </main>
  <!-- Dialog goes here -->
  <Dialog v-model:visible="showPreview" modal header="Listing Preview" class="preview-dialog">
    <ListingsCard
      :listingType="form.listingType"
      :username="user.profile?.username"
      :avatarUrl="user.profile?.avatarUrl"
      :postingTime="null"
      :locationAddress="form.locationAddress"
      :category="form.category"
      :image="form.images?.[0] ?? imageFiles[0]?.url"
      :listingTitle="form.listingTitle"
      :tags="form.tags"
      :status="form.status"
      :quantityNum="form.quantityNum"
      :isPoster="true"
    />
  </Dialog>
</template>

<style scoped>
.p-overflow-hidden {
  overflow: auto;
}

main {
  padding: unset;
}

.container-create-edit-request {
  max-width: 1150px;
  padding-top: 25px;
}

.preview-title {
  margin-bottom: 20px;
  font-size: 1.3em;
}

.preview-btn-container {
  display: none;
  /* margin-top: 50px; */
}

.preview {
  position: sticky;
  width: var(--preview-card-width);
  /* background: red; */
  padding-left: 30px;
  top: 125px;
}

.form-container {
  margin-top: -350px;
}

.form-container form {
  position: relative;
  max-width: 1150px;
  width: 100%;
}

/*************************
*.Request Information
*************************/
.request-information {
  margin-top: 20px;
  /* display: grid;
  grid-template-areas:
    'request-name        request-name'
    'request-category    request-status'
    'request-serving     request-serving'
    'request-restrictions request-restrictions'
    'request-tags        request-tags'
    'request-allergens   request-allergens'
    'request-description request-description'; */
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
}

.request-name {
  grid-area: request-name;
  /* width: 100%; */
  flex: 100%;
}

/* .request-type {
  grid-area: request-type;
} */
.request-category {
  grid-area: request-category;
  /* width: 50%; */
  flex: 40%;
}

.request-status {
  grid-area: request-status;
  /* width: 50%; */
  flex: 40%;
}

.request-serving {
  grid-area: request-serving;
  /* width: 100%; */
  flex: 100%;
}

.request-restrictions {
  grid-area: request-restrictions;
  /* width: 100%; */
  flex: 100%;
}

.request-tags {
  grid-area: request-tags;
  /* width: 100%; */
  flex: 100%;
}

.request-allergens {
  grid-area: request-allergens;
  /* width: 100%; */
  flex: 100%;
}

.request-description {
  grid-area: request-description;
  /* width: 100%; */
  flex: 100%;
}

/*************************
*.Location Information
*************************/
.location-information {
  margin-top: 20px;
  display: grid;
  grid-template-areas: '';
  gap: 40px;
}

/*************************
*.Photo Gallery
*************************/
.photo-gallery {
  /* margin-top: 20px; */
}

.btn-container {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: center;
  gap: 15px;
  background: white;
  box-shadow: 0 -7px 30px rgba(0, 0, 0, 0.075);
  width: inherit;
  padding: 15px;
  z-index: 999;
}

.next-prev-btn-container {
  display: flex;
  gap: 15px;
}

@media screen and (max-width: 768px) {
  main {
    padding-top: 40px;
  }

  .preview-btn-container {
    display: flex;
    justify-content: right;
  }

  .preview {
    display: none;
  }

  .card-container {
    margin-left: unset;
  }

  .btn-container {
    justify-content: space-between;
  }

  .form-container {
    margin-top: 0px;
  }

  .request-information {
    /* grid-template-areas:
      'request-name'
      'request-status'
      'request-category'
      'request-serving'
      'request-restrictions'
      'request-tags'
      'request-allergens'
      'request-description'; */
    gap: 40px;
  }

  .request-category {
    grid-area: request-category;
    /* width: 50%; */
    flex: 100%;
  }

  .request-status {
    grid-area: request-status;
    /* width: 50%; */
    flex: 100%;
  }
}
</style>
