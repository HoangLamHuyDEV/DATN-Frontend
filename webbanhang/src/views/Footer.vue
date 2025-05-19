<!-- src/components/Footer.vue -->
<template>
    <v-footer app color="primary" dark class="text-center py-4">
      <v-container>
        <div>© {{ new Date().getFullYear() }} HTC Bắc Giang. All rights reserved.</div>
        <div class="text-caption mt-1">Liên hệ: 0123-456-789 | Email: contact@htcbacgiang.vn</div>
      </v-container>
    </v-footer>
  </template>
  
  <script setup>
    import { ref, onMounted } from 'vue';

const isLoggedIn = ref(false);

onMounted(() => {
  const token = localStorage.getItem('access_token');
  isLoggedIn.value = !!token;
});

  </script>
  
  <style scoped>
  
  </style>
  