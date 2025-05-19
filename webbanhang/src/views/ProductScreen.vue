<template>
    <v-container class="mt-5">
        <Header />

        <v-row justify="center">
            <v-col cols="12" md="8">
                <v-card elevation="2" class="rounded-xl">
                    <v-card-text>
                        <v-row>
                            <!-- Hình ảnh bên trái -->
                            <v-col cols="12" md="5">
                                <!-- Ảnh chính -->
                                <v-img :src="getImageUrl(selectedImage || product.imgName)" height="100%"
                                    max-height="350" class="rounded-xl mb-3" cover />

                                <!-- Ảnh phụ minh hoạ -->
                                <v-row dense>
                                    <v-col v-for="(img, index) in product.productImages" :key="index" cols="3"
                                        class="px-1">
                                        <v-img :src="getImageUrl(img.name)" height="60" class="rounded hoverable" cover
                                            @click="selectedImage = img.name"
                                            :class="{ 'border': selectedImage === img.name }" />
                                    </v-col>
                                </v-row>
                            </v-col>

                            <!-- Thông tin bên phải -->
                            <v-col cols="12" md="7" class="d-flex flex-column justify-center">
                                <div>
                                    <h2 class="text-h5 font-weight-bold mb-3">{{ product.name }}</h2>
                                    <p><strong>Thương hiệu:</strong> {{ product.brand }}</p>
                                    <p><strong>Màu sắc:</strong> {{ product.color }}</p>
                                    <p><strong>Kích thước:</strong> {{ product.size }} {{ product.unit }}</p>
                                    <p class="text-subtitle-1"><strong>Giá:</strong> {{ product.price?.toLocaleString()
                                    }}₫</p>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>

                    <v-card-actions class="px-6 pb-4">
                        <v-row align="center" justify="space-between" class="w-100">
                            <!-- Cập nhật số lượng -->
                            <v-col cols="12" md="6" class="d-flex align-center justify-center">
                                <v-btn @click="decreaseAmount" color="primary" :disabled="amount <= 1" rounded>
                                    <v-icon>mdi-minus</v-icon>
                                </v-btn>
                                <span class="mx-4" style="font-size: 18px; font-weight: bold;">{{ amount }}</span>
                                <v-btn @click="increaseAmount" color="primary" rounded>
                                    <v-icon>mdi-plus</v-icon>
                                </v-btn>
                            </v-col>

                            <v-col cols="12" md="6" class="text-right">
                                <v-btn color="primary" @click="addToCart" large>Thêm vào giỏ hàng</v-btn>
                            </v-col>
                        </v-row>
                    </v-card-actions>

                    <v-divider class="my-3" />

                    <v-card-text>
                        <div class="product-description">
                            <div v-html="formattedDescription" />
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-divider class="my-3" />

        <!-- Sản phẩm cùng loại -->
        <v-card-text>
            <h3 class="text-h6 font-weight-bold mb-3">Có thể bạn quan tâm</h3>
            <v-row>
                <v-col v-for="item in relatedProducts.slice(0, 4)" :key="item.product_id" cols="12" sm="6" md="3">
                    <v-card @click="goToProduct(item.product_id)" class="hoverable" elevation="1">
                        <v-img :src="getImageUrl(item.imgName)" height="160px" cover />
                        <v-card-text>
                            <div class="font-weight-medium">{{ item.name }}</div>
                            <div class="text-grey">{{ item.price?.toLocaleString() }}₫</div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>


    </v-container>
    <!-- <Footer /> -->
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Header from './Header.vue';
import Footer from './Footer.vue';
const selectedImage = ref(null);

import { watch } from 'vue';
// Router
const route = useRoute();
const router = useRouter();

// Data
const product = ref({});
const amount = ref(1);
const relatedProducts = ref([]);

// 👉 Điều hướng đến sản phẩm khác
const goToProduct = (productId) => {
    router.push(`/product/${productId}`);
};

// 👉 Lấy sản phẩm từ ID
const fetchProduct = async () => {
    try {
        const res = await axios.get(`http://localhost:8080/api/products/soft?id=${route.params.id}`);
        product.value = Array.isArray(res.data) ? res.data[0] : res.data;
        console.log(product.value)
        if (product.value?.type_id) {
            fetchRelatedProducts(product.value.type_id);
        }
        product.value = Array.isArray(res.data) ? res.data[0] : res.data;
        selectedImage.value = null; // Reset khi load sản phẩm mới

    } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
    }
};

// 👉 Sản phẩm cùng loại
const fetchRelatedProducts = async (typeId) => {
    try {
        const res = await axios.get(`http://localhost:8080/api/products/soft?type_id=${typeId}`);
        relatedProducts.value = res.data.filter(p => p.product_id !== product.value.product_id);
    } catch (err) {
        console.error('Lỗi khi tải sản phẩm cùng loại:', err);
    }
};

// 👉 Get image URL
const getImageUrl = (imgName) => {
    if (!imgName) return 'https://cdn.vuetifyjs.com/images/cards/sunshine.jpg';
    return `http://localhost:8080/api/images/${imgName}`;
};

// 👉 Thêm vào giỏ hàng
const addToCart = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("⚠️ Bạn cần đăng nhập để thêm vào giỏ hàng.");
        router.push("/login");
        return;
    }

    try {
        const payload = {
            product_id: product.value.product_id,
            total_price: product.value.price * amount.value,
            amount: amount.value,
        };

        await axios.post("http://localhost:8080/api/orders/add", payload, {
            headers: { Authorization: `Bearer ${token}` },
        });

        alert("✅ Đã thêm vào giỏ hàng!");
    } catch (err) {
        console.error("Lỗi khi thêm vào giỏ hàng:", err);
        alert("❌ Không thể thêm vào giỏ hàng.");
    }
};

// 👉 Tăng giảm số lượng
const increaseAmount = () => amount.value += 1;
const decreaseAmount = () => {
    if (amount.value > 1) amount.value -= 1;
};

// 👉 Mô tả sản phẩm được format
const formattedDescription = computed(() => {
    const description = product.value.description || '';
    return description.replace(/\n/g, '').replace(/- /g, '<br/>• ');
});

// 👉 Load dữ liệu khi mount
onMounted(() => {
    fetchProduct();
});
watch(() => route.params.id, (newId, oldId) => {
    if (newId !== oldId) {
        fetchProduct(); // gọi lại API để load sản phẩm mới
        amount.value = 1; // reset lại số lượng nếu cần
    }
});
</script>

<style scoped>
.v-btn {
    min-width: 36px;
}

span {
    font-size: 18px;
    font-weight: bold;
}

.product-description {
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-line;
}

.product-description strong {
    font-weight: bold;
    margin-bottom: 8px;
    display: block;
}
</style>