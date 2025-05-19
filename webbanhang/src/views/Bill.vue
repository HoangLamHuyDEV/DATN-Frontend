<template>
  <v-container class="py-10">
    <Header/>
    <v-card v-if="bill" class="pa-6 rounded-xl elevation-4">
      <v-card-title class="text-h5 font-weight-bold mb-4">🧾 Chi tiết Hóa đơn #{{ bill.id }}</v-card-title>

      <v-btn @click="exportInvoice" color="primary" class="mb-4">Xuất hoá đơn</v-btn>

      <v-divider class="mb-4"></v-divider>
      <v-row class="mb-2">
        <v-col cols="4" class="font-weight-medium">👤 Khách hàng:</v-col>
        <v-col cols="8">{{ bill.customer_name }}</v-col>
      </v-row>

      <v-row class="mb-2">
        <v-col cols="4" class="font-weight-medium">📅 Ngày tạo:</v-col>
        <v-col cols="8">{{ formatDate(bill.created_at) }}</v-col>
      </v-row>

      <v-row class="mb-2">
        <v-col cols="4" class="font-weight-medium">💳 Phương thức thanh toán:</v-col>
        <v-col cols="8">
          <span v-if="bill.payment_method === 'cod'">Thanh toán trực tiếp</span>
          <span v-else>{{ bill.payment_method }}</span>
        </v-col>
      </v-row>

      <v-row class="mb-2">
        <v-col cols="4" class="font-weight-medium">💸 Tổng tiền:</v-col>
        <v-col cols="8" class="text-red font-weight-bold">{{ formatCurrency(bill.total_price) }}</v-col>
      </v-row>

      <v-divider class="my-6" />

      <v-card-title class="text-h6 font-weight-bold mb-4">🛍️ Danh sách sản phẩm</v-card-title>

      <v-table>
        <thead>
          <tr>
            <th>#</th>
            <th>Sản phẩm</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in bill.items || []" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.product_name }}</td>
            <td>{{ formatCurrency(item.price) }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatCurrency(item.price * item.quantity) }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-alert v-else type="info" class="mt-4" border="start" variant="tonal">
      Đang tải hóa đơn...
    </v-alert>
    <Footer/>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";
import Header from "./Header.vue";
import Footer from "./Footer.vue";
const route = useRoute();
const billId = route.params.id;
const bill = ref(null);

const fetchBill = async () => {
  try {
    const res = await axios.get(`http://localhost:8080/api/bills/${billId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
 
    const data = res.data[0];
    const createdDate = new Date(data.create_date);
    bill.value = {
      id: data.id,
      ngay: createdDate.getDate(),
  thang: createdDate.getMonth() + 1,
  nam: createdDate.getFullYear(),
      customer_name: data.name,
      customer_address: data.receivingAddress || "", // thêm address
      customer_phone: data.phone_number || "",    // thêm phone
      customer_email: "", 
      created_at: data.create_date,
      payment_method: data.pay_method,
      total_price: data.total_price,
      items: data.items || [],
    };
  } catch (err) {
    console.error("Lỗi khi tải hóa đơn:", err);
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "0 ₫";
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

const exportInvoice = async () => {
  if (!bill.value) return;

  try {
    const response = await axios.post(
      "http://localhost:8080/api/bills/invoice",
      bill.value,
      {
        responseType: "blob", // nhận file dạng blob
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    const url = window.URL.createObjectURL(
      new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice-${bill.value.id}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Lỗi khi tải hóa đơn:", error);
  }
};

onMounted(fetchBill);
</script>
