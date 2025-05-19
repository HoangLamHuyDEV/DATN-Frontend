<template>
    <Header />
    <v-container>
      <h2>Quản lý hóa đơn</h2>
  
      <v-data-table
        :headers="headers"
        :items="bills"
        class="elevation-1"
        :loading="loading"
      >
        <template #top>
          <v-toolbar flat>
            <v-toolbar-title>Danh sách hóa đơn</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
        </template>
  
        <template #item.total_price_sum="{ item }">
          {{ formatCurrency(item.total_price_sum) }}
        </template>
  
        <template #item.create_date="{ item }">
          {{ formatDate(item.create_date) }}
        </template>
  
        <template #item.actions="{ item }">
          <v-btn icon  @click="viewBill(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn icon >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
          <v-btn icon  @click="confirmDelete(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
  
      <!-- Dialog xác nhận xóa -->
      <v-dialog v-model="deleteDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-h5">Xác nhận xóa hóa đơn</v-card-title>
          <v-card-text>Bạn có chắc muốn xóa hóa đơn này?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>

           
            <v-btn text @click="deleteDialog = false">Hủy</v-btn>
            <v-btn color="red" text @click="deleteBill">Xóa</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
    </v-container>
    <Footer />
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  import Header from './Header.vue'
  import Footer from './Footer.vue'
  
  const router = useRouter()
  
  const headers = [
    { title: 'Mã hóa đơn', value: 'billId' },
    { title: 'Tên khách hàng', value: 'fullname' },
    { title: 'Tổng tiền', value: 'total_price_sum' },
    { title: 'Ngày tạo', value: 'create_date' },
    {title: 'Trạng thái',value: 'state'},
    { title: 'Hành động', value: 'actions', sortable: false }
  ]
  
  const bills = ref([])
  const loading = ref(false)
  const deleteDialog = ref(false)
  const selectedBill = ref(null)
  
  async function fetchBills() {
    loading.value = true
    try {
      const res = await axios.get('http://localhost:8080/api/orders',{
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            })
      bills.value = res.data.data || res.data
    } catch (error) {
      console.error('Lỗi tải hóa đơn:', error)
    } finally {
      loading.value = false
    }
  }
  
  function viewBill(bill) {
    router.push(`/bills/${bill.billId}`)
  }
  
  function confirmDelete(bill) {
    selectedBill.value = bill
    deleteDialog.value = true
  }
  
  async function deleteBill() {
    if (!selectedBill.value?.billId) return
  
    try {
      await axios.delete(`http://localhost:8080/api/bills/${selectedBill.value.billId}`)
      await fetchBills()
      deleteDialog.value = false
    } catch (error) {
      console.error('Lỗi xóa hóa đơn:', error)
    }
  }
  
  function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }
  
  function formatDate(value) {
    return new Date(value).toLocaleDateString('vi-VN')
  }
  
  onMounted(() => {
    fetchBills()
  })
  </script>
  