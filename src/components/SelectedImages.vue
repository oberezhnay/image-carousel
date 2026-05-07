<script setup lang="ts">

const props = defineProps<{
  urls: string[]
}>()
</script>

<template>
  <section class="selected">
    <h2>Selected Images ({{ urls.length }})</h2>

    <div class="selected-grid">
      <figure 
        v-for="url in urls"
        :key="url"
        class="selected-item"
      >
        <img 
          :src="url" 
          alt="" 
          @load="e => e.target.closest('.selected-item').classList.add('loaded')"
        />
      </figure>
    </div>
  </section>
</template>

<style scoped>
.selected {
  margin-top: 32px;
}
.selected-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.selected-item {
  width: 120px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  opacity: 0 ;
  transition: opacity 0.5s ease;
}
.selected-item.loaded {
  opacity: 1;
}
.selected-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>