<template>
    <v-app-bar flat image="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg" height="65" class="text-white">
        <v-btn></v-btn>
        <router-link to="/" class="text-white text-decoration-none">
            <v-toolbar-title class="cursor-pointer text-h5 font-weight-bold">HTC Bắc Giang</v-toolbar-title>
        </router-link>
        <v-spacer />
        <v-text-field v-model="searchQuery" density="compact" variant="solo-filled" label="Tìm kiếm..."
            prepend-inner-icon="mdi-magnify" hide-details clearable class="mx-2" style="max-width: 450px" />
        <v-btn></v-btn>
    </v-app-bar>

    <v-container class="py-10">
        <v-row justify="center">
            <v-col cols="12" md="8">
                <v-card v-if="userInfo.state === 'Chưa kích hoạt'" class="pa-6 text-center">
                    <v-card-title class="text-h6 font-weight-bold mb-4">
                        🚫 Tài khoản của bạn chưa được kích hoạt
                    </v-card-title>

                    <v-btn v-if="!activationSent" color="primary" @click="sendActivationCode" :loading="loading"
                        size="large" class="mb-4">
                        Gửi mã kích hoạt đến email
                    </v-btn>

                    <v-alert v-if="activationSent" type="info" class="my-4" text>
                        ✅ Mã kích hoạt đã được gửi đến email của bạn. Vui lòng nhập mã bên dưới:
                    </v-alert>

                    <v-text-field v-if="activationSent" v-model="activationCode" label="Nhập mã kích hoạt"
                        class="mb-4"></v-text-field>

                    <v-btn v-if="activationSent" color="success" @click="verifyActivationCode" :loading="verifying"
                        size="large" class="mb-2">
                        Xác nhận kích hoạt
                    </v-btn>

                    <v-btn v-if="activationSent && activationError" variant="text" size="small" color="primary"
                        @click="resendActivationCode" :loading="resending" class="mb-2">
                        Gửi lại mã
                    </v-btn>

                    <v-alert v-if="activationError" type="error" class="mt-4" text>
                        {{ activationError }}
                    </v-alert>
                </v-card>

                <v-card v-else class="pa-6 rounded-xl elevation-4">
                    <v-card-title class="text-h5 font-weight-bold mb-4">👤 Thông tin người dùng</v-card-title>
                    <v-divider class="mb-4"></v-divider>

                    <v-row class="mb-2">
                        <v-col cols="4" class="font-weight-medium">👤 Họ tên:</v-col>
                        <v-col cols="8">{{ userInfo.name }}</v-col>
                    </v-row>
                    <v-row class="mb-2">
                        <v-col cols="4" class="font-weight-medium">📧 Email:</v-col>
                        <v-col cols="8">{{ userInfo.email }}</v-col>
                    </v-row>
                    <v-row class="mb-2">
                        <v-col cols="4" class="font-weight-medium">📱 SĐT:</v-col>
                        <v-col cols="8">{{ userInfo.phone_number }}</v-col>
                    </v-row>
                    <v-row class="mb-2">
                        <v-col cols="4" class="font-weight-medium">📍 Địa chỉ:</v-col>
                        <v-col cols="8">{{ userInfo.ward }}, {{ userInfo.district }}, {{ userInfo.province }}</v-col>
                    </v-row>

                    <v-btn v-if="!editing" color="primary" @click="startEdit" class="mt-4">✏️ Chỉnh sửa thông
                        tin</v-btn>
                    <v-btn color="warning" class="mt-4 ml-2" @click="openPasswordDialog = true">
                        🔐 Đổi mật khẩu
                    </v-btn>

                    <!-- Dialog đổi mật khẩu -->
                    <v-dialog v-model="openPasswordDialog" max-width="500px">
                        <v-card class="pa-4">
                            <v-card-title class="text-h6">🔐 Đổi mật khẩu</v-card-title>
                            <v-card-text>
                                <v-text-field v-model="passwordForm.oldPassword" label="Mật khẩu hiện tại"
                                    type="password" class="mb-3" />
                                <v-text-field v-model="passwordForm.newPassword" label="Mật khẩu mới" type="password"
                                    class="mb-3" />
                                <v-text-field v-model="passwordForm.confirmPassword" label="Xác nhận mật khẩu mới"
                                    type="password" class="mb-3" />
                                <v-alert v-if="passwordError" type="error" class="mb-3" text>{{ passwordError
                                    }}</v-alert>
                                <v-alert v-if="passwordSuccess" type="success" class="mb-3" text>{{ passwordSuccess
                                    }}</v-alert>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn color="primary" @click="changePassword" :loading="changingPassword">💾
                                    Lưu</v-btn>
                                <v-btn variant="text" @click="openPasswordDialog = false">❌ Hủy</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>


                    <v-form v-if="editing" @submit.prevent="updateUserInfo">
                        <v-text-field v-model="editData.name" label="Họ tên" class="mb-3" />
                        <v-text-field v-model="editData.phone_number" label="Số điện thoại" class="mb-3" />

                        <v-alert v-if="userInfo.province && userInfo.district && userInfo.ward" type="info"
                            class="mb-3">
                            📍 Địa chỉ hiện tại: {{ userInfo.ward }}, {{ userInfo.district }}, {{ userInfo.province }}
                        </v-alert>

                        <v-select v-model="selectedProvince" :items="provinces" item-title="name" item-value="id"
                            label="Tỉnh / Thành phố" class="mb-3" @update:model-value="fetchDistricts" />

                        <v-select v-model="selectedDistrict" :items="districts" item-title="name" item-value="id"
                            label="Quận / Huyện" class="mb-3" @update:model-value="fetchWards" />

                        <v-select v-model="editData.ward_id" :items="wards" item-title="name" item-value="id"
                            label="Phường / Xã" class="mb-3" />

                        <v-btn type="submit" color="success" :loading="updating" class="mr-2">💾 Lưu</v-btn>
                        <v-btn variant="text" @click="cancelEdit">❌ Hủy</v-btn>
                    </v-form>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import router from "@/router";

const userInfo = ref({});
const searchQuery = ref("");
const editing = ref(false);
const updating = ref(false);
// Các biến liên quan đến kích hoạt tài khoản
const loading = ref(false);
const verifying = ref(false);
const resending = ref(false);
const activationSent = ref(false);
const activationCode = ref("");
const activationError = ref("");
const editData = ref({ name: "", phone_number: "", ward_id: null });

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

const selectedProvince = ref(null);
const selectedDistrict = ref(null);

const fetchUserInfo = async () => {
    try {
        const res = await axios.get("http://localhost:8080/api/users/me", {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        userInfo.value = res.data;
    } catch {
        router.push("/login");
    }
};

const fetchProvinces = async () => {
    const res = await axios.get("http://localhost:8080/api/users/provinces");
    provinces.value = res.data;
};

const fetchDistricts = async (provinceId) => {
    selectedDistrict.value = null;
    editData.value.ward_id = null;
    districts.value = [];
    wards.value = [];

    const res = await axios.get(`http://localhost:8080/api/users/districts/${provinceId}`);
    districts.value = res.data;
};

const fetchWards = async (districtId) => {
    editData.value.ward_id = null;
    const res = await axios.get(`http://localhost:8080/api/users/wards/${districtId}`);
    wards.value = res.data;
};

const startEdit = async () => {
    editing.value = true;

    Object.assign(editData.value, {
        name: userInfo.value.name,
        phone_number: userInfo.value.phone_number,
        ward_id: userInfo.value.ward_id,
    });

    await fetchProvinces();

    const province = provinces.value.find(p => p.name === userInfo.value.province);
    if (province) {
        selectedProvince.value = province.id;
        await fetchDistricts(province.id);

        const district = districts.value.find(d => d.name === userInfo.value.district);
        if (district) {
            selectedDistrict.value = district.id;
            await fetchWards(district.id);

            // Đảm bảo ward_id vẫn được giữ lại và có trong danh sách wards
            const ward = wards.value.find(w => w.name === userInfo.value.ward);
            if (ward) {
                editData.value.ward_id = ward.id;
            }
        }
    }
};


const cancelEdit = () => {
    editing.value = false;
};

const updateUserInfo = async () => {
    updating.value = true;
    try {
        // console.log("Dữ liệu gửi đi:", editData.value);

        await axios.put("http://localhost:8080/api/users/me", editData.value, {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        await fetchUserInfo();
        editing.value = false;
    } catch (err) {
        console.error("Lỗi cập nhật thông tin:", err);
    } finally {
        updating.value = false;
    }
};
const sendActivationCode = async () => {
    loading.value = true;
    activationError.value = "";
    try {
        await axios.post("http://localhost:8080/api/send-activation-code", null, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        });
        activationSent.value = true;
    } catch (err) {
        activationError.value = "Không thể gửi mã. Vui lòng thử lại sau.";
    } finally {
        loading.value = false;
    }
};

// Gửi lại mã kích hoạt
const resendActivationCode = async () => {
    resending.value = true;
    activationError.value = "";
    try {
        await axios.post("http://localhost:8080/api/send-activation-code", null, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        });
    } catch (err) {
        activationError.value = "Không thể gửi lại mã. Vui lòng thử lại sau.";
    } finally {
        resending.value = false;
    }
};

// Xác nhận mã kích hoạt
const verifyActivationCode = async () => {
    verifying.value = true;
    activationError.value = "";
    try {
        await axios.post(
            "http://localhost:8080/api/verify-activation-code",
            { code: activationCode.value },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            }
        );
        await fetchUserInfo(); // Cập nhật lại thông tin user sau khi xác minh
        activationSent.value = false;
    } catch (err) {
        activationError.value = "Mã không chính xác hoặc đã hết hạn.";
    } finally {
        verifying.value = false;
    }
};
onMounted(() => {
    fetchUserInfo();
});
const openPasswordDialog = ref(false);
const changingPassword = ref(false);
const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const passwordError = ref("");
const passwordSuccess = ref("");

const changePassword = async () => {
  passwordError.value = "";
  passwordSuccess.value = "";

  if (passwordForm.value.newPassword.length < 8) {
    passwordError.value = "Mật khẩu phải ít nhất 8 ký tự.";
    return;
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = "Xác nhận mật khẩu không khớp.";
    return;
  }

  changingPassword.value = true;
  try {
    await axios.put(
      "http://localhost:8080/api/users/change-password",
      {
        password: passwordForm.value.oldPassword,
        resetPassword: passwordForm.value.newPassword,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      }
    );
    passwordSuccess.value = "Đổi mật khẩu thành công.";
    passwordForm.value.oldPassword = "";
    passwordForm.value.newPassword = "";
    passwordForm.value.confirmPassword = "";
    setTimeout(() => {
      openPasswordDialog.value = false;
      passwordSuccess.value = "";
    }, 1500);
  } catch (err) {
    passwordError.value = err.response?.data?.message || "Đổi mật khẩu thất bại.";
  } finally {
    changingPassword.value = false;
  }
};

</script>