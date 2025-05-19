<template>
  <v-app>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card
      class="mx-auto pa-6 rounded-lg"
      width="550"
      elevation="10"
      image="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg"
      style="background-color: rgba(255, 255, 255, 0.85);"
    >
      <v-card-title class="text-center text-h5 font-weight-bold text-white">
        Đăng nhập
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
          v-model="password"
          label="Mật khẩu"
          type="password"
          variant="outlined"
          prepend-inner-icon="mdi-lock"
          clearable
          class="mb-4"
        ></v-text-field>
      </v-card-text>

      <v-card-actions class="d-flex flex-column">
        <v-btn block color="primary" size="large" @click="login" elevation="2" class="mb-2">
          Đăng nhập
        </v-btn>

        <v-btn
          variant="text"
          color="blue-darken-2"
          class="mt-2"
          @click="forgotPassword"
        >
          Quên mật khẩu?
        </v-btn>

        <div class="d-flex justify-center align-center mt-3">
          <span>Chưa có tài khoản?</span>
          <v-btn variant="text" color="blue-darken-2" class="ml-2" @click="register">
            Đăng ký
          </v-btn>
        </div>

        <v-divider class="my-4"></v-divider>

        <v-btn variant="outlined" color="grey-darken-3" @click="guestAccess">
          Tham gia với tư cách khách
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</v-app>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const username = ref("");
const password = ref("");
const errorMessage = ref("");

const login = async () => {
  try {
    const response = await axios.post("http://localhost:8080/api/login", {
      username: username.value,
      password: password.value,
    });

    const { access_token } = response.data.data;
    console.log(access_token);
    localStorage.setItem("access_token", access_token);

    // Chuyển hướng về trang chính
    router.push("/");
  } catch (error) {
    console.error("Đăng nhập thất bại:", error);
    if (error.response) {
      errorMessage.value = error.response.data.message || "Lỗi đăng nhập";
    } else {
      errorMessage.value = "Lỗi kết nối đến server";
    }
  }
};

const forgotPassword = () => {
  // console.log("Chuyển hướng đến trang quên mật khẩu");
  router.push("/resetpassword")
};

const register = () => {
  console.log("Chuyển hướng đến trang đăng ký");
  router.push("/signup");
};

const guestAccess = () => {
  console.log("Truy cập với tư cách khách");
  router.push("/");
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
