<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Carousel from './components/Carousel.vue'
import SelectedImages from './components/SelectedImages.vue'

type ImageItem = {
  id: string
  author: string
  width: number
  height: number
  url: string
  download_url: string
}

const images = ref<ImageItem[]>([]);
const selectedUrls = ref<string[]>([]);

const toggleSelected = (url: string) => {
  if (selectedUrls.value.includes(url)) {
    selectedUrls.value = selectedUrls.value.filter((item) => item !== url);
  } else {
    selectedUrls.value.push(url);
  }
};

onMounted(async () => {
  const savedData = localStorage.getItem('selectedImages');

  if (savedData) {
    selectedUrls.value = JSON.parse(savedData);
  }

  try {
    const response = await fetch('https://picsum.photos/v2/list?page=1&limit=10');
    const data = await response.json();
    images.value = data;
  } catch (error) {
    console.error('Error fetching images:', error);
  }
});

watch(selectedUrls, (value) => {
  localStorage.setItem('selectedImages', JSON.stringify(value));
}, { deep: true });

</script>

<template>
  <main class="app">
    <h1>Image Carousel</h1>
    
    <Carousel
      v-if="images.length"
      :images="images"
      :selected="selectedUrls"
      @toggle-select="toggleSelected" 
    />
   
    <SelectedImages :urls="selectedUrls" />
  </main>
</template>
