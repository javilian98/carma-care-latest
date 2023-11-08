<script setup>
import { ref, defineEmits } from 'vue'

import Image from 'primevue/image'

const emit = defineEmits(['uploadImages'])

const images = ref([])
const isDragging = ref(false)
const fileInput = ref(null)

const selectFiles = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const files = event.target.files

  if (files.length === 0) return

  for (let i = 0; i < files.length; i++) {
    if (files[i].type.split('/')[0] !== 'image') continue
    if (!images.value.some((img) => img.name === files[i].name)) {
      images.value.push({
        name: files[i].name,
        url: URL.createObjectURL(files[i])
      })
    }
  }

  emit('uploadImages', images)
}

const removeImage = (imageName) => {
  const foundIndex = images.value.findIndex((img) => img.name === imageName)

  images.value.splice(foundIndex, 1)

  emit('uploadImages', images)
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragging.value = true
  event.dataTransfer.dropEffect = 'copy'
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragging.value = false
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer.files
  for (let i = 0; i < files.length; i++) {
    if (files[i].type.split('/')[0] !== 'image') continue
    if (!images.value.some((img) => img.name === files[i].name)) {
      images.value.push({
        file: files[i],
        name: files[i].name,
        url: URL.createObjectURL(files[i])
      })
    }
  }

  emit('uploadImages', images)
}
</script>

<template>
  <div class="image-upload">
    <div
      class="drag-area"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <span v-if="!isDragging">
        Drag & drop images here or
        <span class="select" role="button" @click="selectFiles">Choose</span>
      </span>
      <div v-else class="select">Drop images here</div>
      <input
        name="file"
        type="file"
        class="file"
        ref="fileInput"
        multiple
        @change="handleFileSelect"
      />
    </div>
    <div class="upload-thumbnail-container">
      <div class="image" v-for="(image, index) in images" :key="index">
        <span class="delete" @click="removeImage(image.name)">&times;</span>
        <Image :src="image.url" preview />
      </div>
    </div>
  </div>
</template>

<style>
.image-upload {
  width: 100%;
  border-radius: 5px;
  overflow: hidden;
}

.image-upload .drag-area {
  height: 150px;
  border-radius: 8px;
  border: dashed 2px var(--color-primary);
  background: #f7f7f7;
  color: var(--color-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: center;
  -webkit-user-select: none;
}

.image-upload .drag-area > span {
  margin: 0 40px;
  text-align: center;
}

.image-upload .drag-area .visible {
  font-size: 1em;
}

.image-upload .select {
  color: #5268de;
  margin-left: 5px;
  cursor: pointer;
  transition: 0.4s;
}

.image-upload .select:hover {
  opacity: 0.6;
}

.image-upload .upload-thumbnail-container {
  width: 100%;
  height: auto;
  gap: 10px;
  flex-wrap: wrap;
  position: relative;
  margin-bottom: 8px;
  padding-top: 30px;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  justify-items: center;
}

.image-upload .upload-thumbnail-container .image {
  width: 100px;
  height: 100px;
  margin-right: 5px;
  position: relative;
  margin-bottom: 8px;
  box-shadow: 0 7px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border-radius: 15px;
}

.image-upload .upload-thumbnail-container .image img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.image-upload .upload-thumbnail-container .image .delete {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 1.3em;
  cursor: pointer;
  z-index: 1;
  color: white;
  background: var(--color-primary);
  width: 25px;
  height: 25px;
  border: solid 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.4s;
}

.image-upload .upload-thumbnail-container .image .delete:hover {
  opacity: 0.6;
}

.image-upload input,
.image-upload .drag-area .on-drop,
.image-upload .drag-area.dragover .visible {
  display: none;
}
</style>
