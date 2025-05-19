<template>
    <v-container class="d-flex justify-center align-center" style="height: 100vh;">
      <v-card elevation="3" width="400">
        <v-card-title class="text-h5">Đặt Lại Mật Khẩu</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="resetPassword" ref="formRef">
            <v-text-field
              v-model="username"
              label="Tên đăng nhập"
              required
            ></v-text-field>
            <v-btn
              :loading="loading"
              type="submit"
              color="primary"
              class="mt-3"
              block
            >
              Gửi yêu cầu
            </v-btn>
          </v-form>
          <v-alert
            v-if="message"
            :type="success ? 'success' : 'error'"
            class="mt-4"
            dense
          >
            {{ message }}
          </v-alert>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "ResetPass",
    data() {
      return {
        username: "",
        loading: false,
        message: "",
        success: false,
      };
    },
    methods: {
      async resetPassword() {
        this.loading = true;
        this.message = "";
        this.success = false;
  
        try {
          const res = await axios.post("http://localhost:8080/api/reset-password", {
            username: this.username
          });
  
          this.success = res.data.success;
          this.message = res.data.message;
        } catch (error) {
          this.success = false;
          this.message = error.response?.data?.message || "Đã xảy ra lỗi";
        } finally {
          this.loading = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .v-card {
    padding: 20px;
  }
  </style>
  