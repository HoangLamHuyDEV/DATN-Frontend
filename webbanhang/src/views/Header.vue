<template>
    <!-- Side menu cho admin -->
    <v-navigation-drawer v-if="isAdmin || isEmployee" v-model="drawer" app permanent>
        <v-list>
            <v-list-item>
                <v-icon start>mdi-view-dashboard</v-icon>
                <v-list-item-title>Menu {{ isAdmin ? 'quản trị' : 'nhân viên' }}</v-list-item-title>
            </v-list-item>

            <!-- Mục chung cho Admin và Employee -->
            <v-list-item @click="router.push('/admin/products')">
                <v-icon start>mdi-package-variant</v-icon>
                <v-list-item-title>Quản lý sản phẩm</v-list-item-title>
            </v-list-item>

            <v-list-item @click="router.push('/admin/orders')">
                <v-icon start>mdi-receipt-text</v-icon>
                <v-list-item-title>Quản lý đơn hàng</v-list-item-title>
            </v-list-item>

            <!-- Chỉ Admin mới thấy 2 mục này -->
            <v-list-item v-if="isAdmin" @click="router.push('/admin/users')">
                <v-icon start>mdi-account-group</v-icon>
                <v-list-item-title>Quản lý người dùng</v-list-item-title>
            </v-list-item>

            <v-list-item v-if="isAdmin" @click="router.push('/admin/categories')">
                <v-icon start>mdi-format-list-bulleted-type</v-icon>
                <v-list-item-title>Quản lý danh mục</v-list-item-title>
            </v-list-item>
        </v-list>

    </v-navigation-drawer>

    <!-- App bar -->
    <v-app-bar flat image="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg" height="65" class="text-white" app>
        <v-toolbar-title class="cursor-pointer text-h5 font-weight-bold" @click="router.push('/')">
            HTC Bắc Giang
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-text-field v-model="searchQuery" density="compact" variant="solo" label="Tìm kiếm..."
            prepend-inner-icon="mdi-magnify" hide-details clearable class="mr-2" style="max-width: 450px"
            @keydown.enter="handleSearch" @click:clear="searchQuery = ''" />


        <v-btn v-if="username" icon @click="goToCart">
            <v-icon>mdi-cart</v-icon>
        </v-btn>

        <v-menu v-if="username">
            <template v-slot:activator="{ props }">
                <v-btn v-bind="props" append-icon="mdi-menu-down">{{ username }}</v-btn>
            </template>
            <v-list>
                <v-list-item>
                    <v-list-item-subtitle>{{ userInfo.state }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item @click="info">
                    <v-list-item-title>Tài khoản</v-list-item-title>
                </v-list-item>
                <v-list-item @click="logout">
                    <v-list-item-title>Đăng xuất</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>

        <v-btn v-else @click="router.push('/login')">Đăng nhập</v-btn>
    </v-app-bar>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
// import ChatBot from './ChatBot.vue';
const router = useRouter();
const searchQuery = ref('');
const username = ref('');
const userInfo = ref({});
const drawer = ref(false); // Side menu control
const isEmployee = computed(() => userInfo.value.role === 'Employee');

const isAdmin = computed(() => userInfo.value.role === 'Admin');

const logout = () => {
    localStorage.removeItem('access_token');
    username.value = '';
    userInfo.value = {};
    router.push('/login');
};

const info = () => {
    router.push('/profile');
};

const goToCart = () => {
    router.push('/cart');
};
const handleSearch = () => {
    if (searchQuery.value.trim()) {
        router.push({ path: '/products', query: { search: searchQuery.value } });
    }
};

onMounted(async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
        try {
            const res = await axios.get('http://localhost:8080/api/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            username.value = res.data.username;
            userInfo.value = res.data;
            // console.log(res.data.role);
            // Tự động mở side menu nếu là admin
            if (['Admin', 'Employee'].includes(res.data.role)) {
                drawer.value = true;
            }


        } catch (err) {
            console.error('Lỗi khi lấy thông tin người dùng:', err);
        }
    }
});
</script>