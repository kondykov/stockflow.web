<script setup lang="ts">
import type {ProductImage} from '~/types/product'

interface Props {
  images: ProductImage[]
  coverImageIndex: number
  mode?: 'editable' | 'readonly'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'readonly'
})

const emit = defineEmits<{
  'set-cover': [index: number]
  'remove-image': [index: number]
  'upload-files': [event: Event]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const toast = useToast()

const isEditable = computed(() => props.mode === 'editable')

const handleSetCover = (index: number) => {
  if (!isEditable.value) return

  emit('set-cover', index)
  toast.add({
    title: 'Обложка обновлена',
    description: `Фото ${index + 1} теперь на обложке`,
    icon: 'i-lucide-image',
    color: 'info'
  })
}

const handleRemoveImage = (index: number) => {
  emit('remove-image', index)
}

const handleFileInput = (event: Event) => {
  emit('upload-files', event)
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-lg">Фотографии</h3>
        <p v-if="isEditable" class="text-xs text-gray-400">Кликните на фото, чтобы сделать обложкой</p>
      </div>
    </template>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        v-if="mode=='readonly' && images.length < 1"
      >
        <div class="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400">
          <UIcon name="i-lucide-image" class="w-8 h-8 mb-2" />
          <span class="text-xs">Нет фотографий</span>
        </div>
      </div>
      <div
        v-else
        v-for="(img, i) in images"
        :key="i"
        class="relative aspect-[3/4] rounded-xl overflow-hidden group border"
        :class="isEditable ? 'border-gray-200 dark:border-gray-700 cursor-pointer' : 'border-gray-300 dark:border-gray-600 cursor-default'"
        @click="handleSetCover(i)"
      >
        <img
          :src="img.url"
          class="w-full h-full object-cover"
          :class="isEditable ? 'transition-transform group-hover:scale-105' : ''"
        />

        <div
          v-if="isEditable"
          class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
        >
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="solid"
            size="xs"
            @click.stop="handleRemoveImage(i)"
          />
        </div>

        <div
          v-if="i === coverImageIndex"
          class="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full"
        >
          Обложка
        </div>
      </div>

      <button
        v-if="isEditable"
        type="button"
        class="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all group"
        @click="fileInput?.click()"
      >
        <UIcon name="i-lucide-upload" class="w-8 h-8 mb-2 text-gray-400 group-hover:text-primary"/>
        <span class="text-xs text-gray-500 group-hover:text-primary">Загрузить</span>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          multiple
          accept="image/*"
          @change="handleFileInput"
        />
      </button>
    </div>
  </UCard>
</template>
