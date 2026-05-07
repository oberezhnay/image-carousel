<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

  type ImageItem = {
    id: string
    author: string
    width: number
    height: number
    url: string
    download_url: string
  }

  const props = defineProps<{
    images: ImageItem[]
    selected: string[]
  }>()

  const emit = defineEmits<{
    (event: 'toggle-select', url: string): void
  }>()

  const currentIndex = ref(0);
  const containerWidth = ref(0);
  const slidesPerView = ref(1);
  const slideWidth = ref(320);
  const gap = 12;
  const carouselRef = ref<HTMLElement | null>(null);
  const trackRef = ref<HTMLElement | null>(null);
  let observer: ResizeObserver | null = null;

  const onToggleSelect = (url: string) => {
    emit('toggle-select', url);
  };

  const isSelected = (url: string) => props.selected.includes(url);

  const measureSlides = () => {
    const root = carouselRef.value;
    if (!root) return;
    containerWidth.value = root.clientWidth;

    if (containerWidth.value < 600) {
      slidesPerView.value = 1;
    } else {
      slidesPerView.value = Math.max(1, Math.floor(containerWidth.value / 320));
    }

    const totalGaps = (slidesPerView.value - 1) * gap;
    slideWidth.value = Math.floor((containerWidth.value - totalGaps) / slidesPerView.value);
  };

  const imagesCount = () => props.images.length;

  const next = () => {
    if (imagesCount() === 0) return;
    currentIndex.value = currentIndex.value + 1;
  };

  const prev = () => {
    if (imagesCount() === 0) return;
    currentIndex.value = currentIndex.value - 1;
  };

 
  const duplicated = computed(() => {
    if (!props.images || props.images.length === 0) return [] as ImageItem[];
    return [...props.images, ...props.images, ...props.images];
  });

  const onTrackTransitionEnd = (e: TransitionEvent) => {
    if (!props.images || props.images.length === 0) return;
    const len = props.images.length;
    if (currentIndex.value >= len * 2) {
      if (trackRef.value) trackRef.value.style.transition = 'none';
      currentIndex.value = currentIndex.value - len;
      void (trackRef.value && trackRef.value.offsetHeight);
      if (trackRef.value) trackRef.value.style.transition = '';
    } else if (currentIndex.value < len) {
      if (trackRef.value) trackRef.value.style.transition = 'none';
      currentIndex.value = currentIndex.value + len;
      void (trackRef.value && trackRef.value.offsetHeight);
      if (trackRef.value) trackRef.value.style.transition = '';
    }
  };

  onMounted(() => {
    if (!carouselRef.value) return;
    measureSlides();
    observer = new ResizeObserver(entries => {

      for (let entry of entries) {

        if (entry.target === carouselRef.value) {
          containerWidth.value = entry.contentRect.width;
          measureSlides();
        }
      }
    });
    observer.observe(carouselRef.value);
    
    if (props.images.length) currentIndex.value = props.images.length;
    if (trackRef.value) trackRef.value.addEventListener('transitionend', onTrackTransitionEnd as EventListener);
  });

  onBeforeUnmount(() => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (trackRef.value) trackRef.value.removeEventListener('transitionend', onTrackTransitionEnd as EventListener);
  });

  const translateX = computed(() => {
    const step = slideWidth.value + gap;
    return `translateX(-${currentIndex.value * step}px)`;
  });

  watch(() => props.images.length, (len) => {
    if (len > 0) {
      currentIndex.value = len; // reset to middle copy
      setTimeout(() => measureSlides(), 0);
    } else {
      currentIndex.value = 0;
    }
  });

</script>

<template>
  <section class="carousel">
    <button class="nav-btn prev" @click="prev">Prev</button>

    <div class="viewport" ref="carouselRef">
      <div 
        class="track" 
        ref="trackRef"
        :style="{ transform: translateX }"
      >
        <article 
          v-for="(image, idx) in duplicated" 
          :key="image.id + '-' + idx" 
          class="slide"
          :style="{ width: slideWidth + 'px', marginRight: idx === duplicated.length - 1 ? '0px' : gap + 'px' }"
        >
          <img :src="image.download_url" :alt="image.author" />

          <button
            class="like-btn"
            :class="{ 'active': isSelected(image.download_url) }"
            @click.stop="onToggleSelect(image.download_url)"
          >
            ♥
          </button>
          
          <div class="overlay">           
            <span class="author">{{ image.author }}</span>
          </div>
        </article>
      </div>
    </div>

    <button class="nav-btn next" @click="next">Next</button>
  </section>
  
</template>

<style scoped>
.carousel { 
  display: flex;
  align-items: center;
  grid-template: 12px;
}

.viewport {
  overflow: hidden;
  flex: 1;
}

.nav-btn {
  width: 42px;
  height: 42px;
  background: rgba(190, 187, 188, 0.85);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  margin: 0 5px;
  border: none;
  padding: 8px 16px;
  border-radius: 50%;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: rgb(55, 55, 55);
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.nav-btn:active {
  transform: scale(0.95);
}


.track {
  display: flex;
  width: max-content;
  transition: transform 0.5s ease;
}
.slide {
  position: relative;
  flex: 0 0 auto;
  width: auto;
  margin-right: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(0);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}
.slide:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 35px rgba(0, 0, 0, 0.25);
}
.slide img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  display: block;
}

.like-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 28px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.like-btn:hover {
  background: white;
  transform: scale(1.1);
}
.like-btn.active {
  background: #ff4f8b;
  color: #fff;
  transform: scale(1.15);
}
.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: #fff;
  font-size: 12px;
}

.slide--selected {
  outline: 3px solid #ff4f8b;
  box-shadow: 0 0 0 3px rgba(255, 79, 139, 0.4);
}
</style> 
