<template>
    <v-container >
      <v-card
        class="mx-auto pa-6 rounded-lg"
        width="550"
        elevation="10"
        image="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg"
        style="background-color: rgba(255, 255, 255, 0.85);"
      >
        <v-card-title class="text-center text-h5 font-weight-bold text-white">
          Đăng ký tài khoản
        </v-card-title>
  
        <v-card-text>
          <v-text-field
            v-model="username"
            label="Tên đăng nhập"
            variant="outlined"
            prepend-inner-icon="mdi-account"
            clearable
            class="mb-4"
          ></v-text-field>
  
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="outlined"
            prepend-inner-icon="mdi-email"
            clearable
            class="mb-4"
          ></v-text-field>
  
          <v-text-field
            v-model="password"
            label="Mật khẩu"
            type="password"
            variant="outlined"
            prepend-inner-icon="mdi-lock"
            clearable
            class="mb-4"
          ></v-text-field>
  
          <v-text-field
            v-model="confirmPassword"
            label="Nhập lại mật khẩu"
            type="password"
            variant="outlined"
            prepend-inner-icon="mdi-lock-check"
            clearable
            class="mb-4"
          ></v-text-field>
  
          <v-alert v-if="errorMessage" type="error" class="mb-4" dense>
            {{ errorMessage }}
          </v-alert>
  
          <v-alert v-if="successMessage" type="success" class="mb-4" dense>
            {{ successMessage }}
          </v-alert>
        </v-card-text>
  
        <v-card-actions class="d-flex flex-column">
          <v-btn block color="primary" size="large" @click="register" elevation="2" class="mb-2">
            Tạo tài khoản
          </v-btn>
  
          <div class="d-flex justify-center align-center mt-3">
            <span>Đã có tài khoản?</span>
            <v-btn variant="text" color="blue-darken-2" class="ml-2" @click="goToLogin">
              Đăng nhập
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import axios from "axios";
  
  const router = useRouter();
  
  const username = ref("");
  const email = ref("");
  const password = ref("");
  const confirmPassword = ref("");
  const errorMessage = ref("");
  const successMessage = ref("");
  
  const register = async () => {
    errorMessage.value = "";
    successMessage.value = "";
  
    // Kiểm tra xác nhận mật khẩu
    if (password.value !== confirmPassword.value) {
      errorMessage.value = "Mật khẩu và xác nhận mật khẩu không khớp!";
      return;
    }
  
    try {
      // Gọi API đăng ký
      await axios.post("http://localhost:8080/api/signup", {
        username: username.value,
        email: email.value,
        password: password.value,
      });
  
      // Tự động đăng nhập nếu đăng ký thành công
      const loginResponse = await axios.post("http://localhost:8080/api/login", {
        username: username.value,
        password: password.value,
      });
  
      const { access_token } = loginResponse.data.data;
      localStorage.setItem("access_token", access_token);
  
      // Chuyển hướng đến trang chính
      router.push("/");
    } catch (error) {
      console.error("Lỗi khi đăng ký hoặc đăng nhập:", error);
      if (error.response) {
        errorMessage.value = error.response.data.message || "Lỗi đăng ký hoặc đăng nhập";
      } else {
        errorMessage.value = "Lỗi kết nối đến server";
      }
    }
  };
  
  const goToLogin = () => {
    router.push("/login");
  };
  </script>
  
  <style scoped>
  .v-card {
    transition: all 0.3s ease;
  }
  .v-card:hover {
    transform: scale(1.02);
  }
  
  .v-btn {
    transition: all 0.3s ease;
  }
  .v-btn:hover {
    transform: scale(1.05);
  }
  
  .mb-4 {
    margin-bottom: 16px;
  }
  .mt-3 {
    margin-top: 24px;
  }
  .ml-2 {
    margin-left: 8px;
  }
  .text-white {
    color: white !important;
  }
  </style>
  