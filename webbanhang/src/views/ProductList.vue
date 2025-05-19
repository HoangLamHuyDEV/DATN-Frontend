<template>
    <Header />
    <!-- <Footer/> -->
    <v-container class="mt-5">
        <v-card-title class="text-wrap text-h4">
            Kết quả tìm kiếm từ khoá: {{ searchKeyword }}
        </v-card-title>

        <v-row v-if="products.length" class="d-flex flex-column ga-4">
            <v-col v-for="(product, index) in products" :key="index" cols="12">
                <!-- On click, navigate to the product detail page -->
                <v-card @click="goToProductDetail(product.product_id)" elevation="2" class="rounded-xl pa-4">
                    <v-row align="center">
                        <v-col cols="3">
                            <v-img :src="`http://localhost:8080/api/images/${product.imgName || 'default.jpg'}`"
                                alt="Ảnh sản phẩm" height="200" width="200" cover class="rounded-xl" />
                        </v-col>
                        <v-col cols="8">
                            <v-card-title class="text-wrap text-h5">{{ product.name }}</v-card-title>
                            <v-card-title class="text-wrap text-h6">Loại sản phẩm: {{ product.type }}</v-card-title>
                            <v-card-title class="text-wrap text-h6">Hãng: {{ product.brand }}</v-card-title>
                            <v-card-text>
                                <div class="mb-2">
                                    <strong>Giá: </strong>{{ product.price.toLocaleString() }} VNĐ
                                </div>
                            </v-card-text>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>

        <!-- Hiển thị thông báo nếu không có sản phẩm -->
        <v-alert v-else type="info" class="mt-4">Không tìm thấy sản phẩm nào.</v-alert>

    </v-container>

</template>
<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Header from './Header.vue';
import Footer from './Footer.vue';
const route = useRoute();
const router = useRouter();
const products = ref([]);
const searchKeyword = ref(route.query.search || '');

// Fetch products from the API
const fetchProducts = async () => {
    try {
        const res = await axios.get('http://localhost:8080/api/products/search', {
            params: { keyword: searchKeyword.value }
        });
        products.value = res.data;
    } catch (error) {
        console.error("Lỗi khi tìm sản phẩm:", error);
    }
};

onMounted(fetchProducts);

// Watch for changes in the search query from the route
watch(() => route.query.search, (newKeyword) => {
    searchKeyword.value = newKeyword || '';
    fetchProducts();
});

// Navigate to the product detail page
const goToProductDetail = (productId) => {
    router.push(`/product/${productId}`);
};
</script>