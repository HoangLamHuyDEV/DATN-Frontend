<template>
    <v-container>
      <Header />
  
      <v-row>
        <v-col cols="12">
          <h2>Quản lý danh mục</h2>
  
          <v-data-table
            :headers="headers"
            :items="categories"
            class="elevation-1"
            :loading="loading"
          >
            <template #top>
              <v-toolbar flat>
                <v-toolbar-title>Danh sách danh mục</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="openDialog()">Thêm danh mục</v-btn>
              </v-toolbar>
            </template>
            
            <template #item.actions="{ item }">
              <v-btn icon @click="openDialog(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon @click="confirmDelete(item)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
  
      <!-- Dialog thêm/sửa danh mục -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ isEditing ? 'Sửa danh mục' : 'Thêm danh mục' }}</span>
          </v-card-title>
  
          <v-card-text>
            <v-text-field v-model="newCategory.name" label="Tên danh mục" />
          </v-card-text>
  
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeDialog">Hủy</v-btn>
            <v-btn color="primary" text @click="saveCategory">Lưu</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Dialog xác nhận xóa -->
      <v-dialog v-model="deleteDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-h5">Xác nhận xóa</v-card-title>
  
          <v-card-text>Bạn có chắc muốn xóa danh mục này?</v-card-text>
  
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="deleteDialog = false">Hủy</v-btn>
            <v-btn color="red" text @click="deleteCategory">Xóa</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
    <Footer/>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import Header from './Header.vue'
  import Footer from './Footer.vue'
  // API URL base
  const API_URL = 'http://localhost:8080/api/product-infor/types'
  
  const headers = [
    {title: 'Mã danh mục',value: 'id'},
    { title: 'Tên danh mục', value: 'name' },
    { title: 'Hành động', value: 'actions', sortable: false }
  ]
  
  const categories = ref([])
  const loading = ref(false)
  
  const dialog = ref(false)
  const deleteDialog = ref(false)
  const newCategory = ref({ name: '' })
  const isEditing = ref(false)
  const selectedItem = ref(null)
  
  // Load danh sách danh mục
  async function fetchCategories() {
    loading.value = true
    try {
      const res = await axios.get(API_URL)

      categories.value = res.data.data
    } catch (error) {
      console.error('Lỗi tải danh mục:', error)
    } finally {
      loading.value = false
    }
  }
  
  // Mở Dialog Thêm hoặc Sửa
  function openDialog(item = null) {
    if (item) {
      newCategory.value = { ...item }
      selectedItem.value = item
      isEditing.value = true
    } else {
      newCategory.value = { name: '' }
      selectedItem.value = null
      isEditing.value = false
    }
    dialog.value = true
  }
  
  // Đóng Dialog
  function closeDialog() {
    dialog.value = false
    newCategory.value = { name: '' }
    selectedItem.value = null
  }
  
  // Lưu danh mục (Thêm hoặc Sửa)
  async function saveCategory() {
    if (newCategory.value.name.trim() === '') return
  
    try {
      if (isEditing.value && selectedItem.value?.id) {
        // Sửa danh mục
        await axios.put(`${API_URL}/${selectedItem.value.id}`, newCategory.value)
      } else {
        // Thêm danh mục
        await axios.post(API_URL, newCategory.value)
      }
      await fetchCategories()
      closeDialog()
    } catch (error) {
      console.error('Lỗi lưu danh mục:', error)
    }
  }
  
  // Xác nhận xóa
  function confirmDelete(item) {
    selectedItem.value = item
    deleteDialog.value = true
  }
  
  // Xóa danh mục
  async function deleteCategory() {
    if (!selectedItem.value?.id) return
  
    try {
      await axios.delete(`${API_URL}/${selectedItem.value.id}`)
      await fetchCategories()
      deleteDialog.value = false
    } catch (error) {
      console.error('Lỗi xóa danh mục:', error)
    }
  }
  
  onMounted(() => {
    fetchCategories()
  })
  </script>
  