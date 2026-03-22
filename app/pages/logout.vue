<script setup lang="ts">
import {useAuth} from "~/composable/auth";

definePageMeta({
  middleware: 'authenticated'
})

useAuth().logout()
</script>
