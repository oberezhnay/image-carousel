// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Carousel from './Carousel.vue'

const mockImages = [
  {
    id: '1',
    author: 'Author 1',
    width: 500,
    height: 300,
    url: 'https://example.com/1',
    download_url: 'https://example.com/download/1',
  },
  {
    id: '2',
    author: 'Author 2',
    width: 500,
    height: 300,
    url: 'https://example.com/2',
    download_url: 'https://example.com/download/2',
  },
  {
    id: '3',
    author: 'Author 3',
    width: 500,
    height: 300,
    url: 'https://example.com/3',
    download_url: 'https://example.com/download/3',
  },
]

const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver

  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get() {
      return 800
    },
  })

  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
      return 320
    },
  })
})

afterAll(() => {
  if (originalClientWidth) {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', originalClientWidth)
  }
  if (originalOffsetWidth) {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth)
  }
})

describe('Carousel.vue', () => {
  it('renders duplicated slide items and image attributes', async () => {
    const wrapper = mount(Carousel, {
      props: {
        images: mockImages,
        selected: [],
      },
    })

    const slides = wrapper.findAll('.slide')
    expect(slides).toHaveLength(mockImages.length * 3)
    expect(wrapper.find('img').attributes('src')).toBe(mockImages[0].download_url)
    expect(wrapper.find('img').attributes('alt')).toBe(mockImages[0].author)
  })

  it('emits toggle-select when like button is clicked', async () => {
    const wrapper = mount(Carousel, {
      props: {
        images: mockImages,
        selected: [],
      },
    })

    const firstLikeButton = wrapper.find('.like-btn')
    await firstLikeButton.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('toggle-select')
    expect(wrapper.emitted('toggle-select')?.[0]).toEqual([mockImages[0].download_url])
  })

  it('updates transform when next and prev buttons are clicked', async () => {
    const wrapper = mount(Carousel, {
      props: {
        images: mockImages,
        selected: [],
      },
    })

    const track = wrapper.find('.track')
    const initialStyle = track.attributes('style')
    expect(initialStyle).toContain('translateX(')

    await wrapper.find('.next').trigger('click')
    const nextStyle = track.attributes('style')
    expect(nextStyle).not.toBe(initialStyle)

    await wrapper.find('.prev').trigger('click')
    const prevStyle = track.attributes('style')
    expect(prevStyle).not.toBe(nextStyle)
    expect(prevStyle).toContain('translateX(')
  })

  it('marks selected images with active state', async () => {
    const wrapper = mount(Carousel, {
      props: {
        images: mockImages,
        selected: [mockImages[1].download_url],
      },
    })

    const likeButtons = wrapper.findAll('.like-btn')
    expect(likeButtons[0].classes()).not.toContain('active')
    expect(likeButtons[1].classes()).toContain('active')
  })
})
