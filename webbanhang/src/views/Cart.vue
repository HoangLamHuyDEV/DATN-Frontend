<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Header from './Header.vue';
import { useRouter } from 'vue-router';

const cartItems = ref([]);
const isAuthenticated = ref(false);
const showCheckout = ref(false);
const isPaying = ref(false);
const userInfo = ref(null);
const router = useRouter();

const checkoutForm = ref({
    name: '',
    phone: '',
    province_id: null,
    district_id: null,
    ward_id: null,
    address: '',
    paymentMethod: 'zalopay',
});
const showBills = ref(false);
const bills = ref([]);

const fetchBills = async () => {
    try {
        const res = await axios.get("http://localhost:8080/api/users/bills", {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        bills.value = res.data;
        console.log(bills.value)
    } catch (err) {
        console.error("Lỗi khi lấy danh sách đơn đã đặt:", err);
    }
};

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

const fetchProvinces = async () => {
    try {
        const res = await axios.get('http://localhost:8080/api/users/provinces');
        provinces.value = res.data;
    } catch (err) {
        console.error('Lỗi tải tỉnh/thành:', err);
    }
};

const fetchDistricts = async (provinceId) => {
    if (!provinceId) return;
    checkoutForm.value.district_id = null;
    checkoutForm.value.ward_id = null;
    districts.value = [];
    wards.value = [];
    try {
        const res = await axios.get(`http://localhost:8080/api/users/districts/${provinceId}`);
        districts.value = res.data;
    } catch (err) {
        console.error('Lỗi tải quận/huyện:', err);
    }
};

const fetchWards = async (districtId) => {
    if (!districtId) return;
    checkoutForm.value.ward_id = null;
    wards.value = [];
    try {
        const res = await axios.get(`http://localhost:8080/api/users/wards/${districtId}`);
        wards.value = res.data;
    } catch (err) {
        console.error('Lỗi tải phường/xã:', err);
    }
};

const fetchUserInfo = async () => {
    try {
        const res = await axios.get("http://localhost:8080/api/users/me", {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        userInfo.value = res.data;
        checkoutForm.value.name = res.data.name || '';
        checkoutForm.value.phone = res.data.phone_number || '';
        checkoutForm.value.address = res.data.address || '';

        await fetchProvinces();

        const province = provinces.value.find(p => p.name === userInfo.province);
        if (province) {
            checkoutForm.value.province_id = province.name;
            await fetchDistricts(province.id);

            const district = districts.value.find(d => d.name === res.data.district);
            if (district) {
                checkoutForm.value.district_id = district.id;
                await fetchWards(district.id);

                const ward = wards.value.find(w => w.name === res.data.ward);
                if (ward) {
                    checkoutForm.value.ward_id = ward.code;
                }
            }
        }
    } catch (err) {
        console.error('Lỗi khi lấy thông tin người dùng:', err);
        router.push("/login");
    }
};

const fetchCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return (isAuthenticated.value = false);

    const res = await axios.get('http://localhost:8080/api/orders/me', {
        headers: { Authorization: `Bearer ${token}` },
    });
    console.log(res.data)

    cartItems.value = res.data.map(i => ({ ...i, newAmount: i.amount }));
    isAuthenticated.value = true;
};

const updateQuantity = async (item) => {
    const token = localStorage.getItem('access_token');
    await axios.post(
        'http://localhost:8080/api/orders/add',
        {
            product_id: item.product_id,
            amount: item.newAmount,
            total_price: item.newAmount * item.unit_price,
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    await fetchCart();
};

const checkoutItem = ref(null);

const handleCheckout = async () => {
    if (!checkoutItem.value) return;
    isPaying.value = true;
    const item = checkoutItem.value;

    const selectedProvince = provinces.value.find(p => p.id === checkoutForm.value.province_id)?.name || '';
    const selectedDistrict = districts.value.find(d => d.id === checkoutForm.value.district_id)?.name || '';
    const selectedWard = wards.value.find(w => w.id === checkoutForm.value.ward_id)?.name || '';

    const fullAddress = `${checkoutForm.value.address}, ${selectedWard}, ${selectedDistrict}, ${selectedProvince}`;

    const billData = {
        name: checkoutForm.value.name,
        phone_number: checkoutForm.value.phone,
        acc_order_id: item.acc_order_id,
        status_id: 5,
        receivingAddress: fullAddress,
        total_price: item.newAmount * item.unit_price,
        pay_method: checkoutForm.value.paymentMethod,
    };


    try {
        if (checkoutForm.value.paymentMethod === 'zalopay') {
            const res = await axios.post(
                'http://localhost:8080/api/zalopay/create-zalopay-order',
                {
                    amount: billData.total_price,
                    description: `Thanh toán sản phẩm: ${item.product_name}`,
                    user_id: 'guest',
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
            );

            // 👉 Sau khi gọi ZaloPay thành công, tạo bill trước khi redirect
            await axios.post('http://localhost:8080/api/users/bills', billData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });

            if (res.data?.order_url) {
                window.location.href = res.data.order_url;
            }

        } else {
            // 👉 COD - tạo bill ngay
            await axios.post('http://localhost:8080/api/users/bills', billData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });

            alert('Thanh toán COD thành công!');
            showCheckout.value = false;
        }
    } catch (err) {
        console.error('Thanh toán lỗi:', err);
        alert('Thanh toán thất bại.');
    } finally {
        isPaying.value = false;
    }
};


const getImageUrl = (imgName) =>
    imgName ? `http://localhost:8080/api/images/${imgName}` : 'https://cdn.vuetifyjs.com/images/cards/sunshine.jpg';

const increaseAmount = (item) => item.newAmount++;
const decreaseAmount = (item) => item.newAmount > 1 && item.newAmount--;

onMounted(() => {
    fetchCart();
    fetchUserInfo();
});
</script>

<template>
    <v-container class="mt-5">
        <Header />

        <div v-if="isAuthenticated">
            <h2 class="text-h5 font-weight-bold mb-4">🛒 Giỏ hàng của bạn
                <v-btn class="mt-2 ml-4" @click="() => { showBills = true; fetchBills(); }">
                    Xem đơn đã đặt
                </v-btn>
            </h2>

            <v-row v-if="cartItems.length" class="d-flex flex-column ga-4">
                <v-col v-for="(item, index) in cartItems" :key="index" cols="12">
                    <v-card elevation="2" class="rounded-xl pa-4">
                        <v-row align="center">
                            <v-col cols="3">
                                <v-img :src="getImageUrl(item.imgName)" height="150" width="150" cover
                                    class="rounded-xl" />
                            </v-col>
                            <v-col cols="8">
                                <v-card-title class="text-wrap text-h6">{{ item.product_name }}</v-card-title>
                                <v-card-text>
                                    <div class="mb-2 d-flex align-center">
                                        <strong class="mr-2">Số lượng:</strong>
                                        <v-btn icon @click="decreaseAmount(item)">
                                            <v-icon>mdi-minus</v-icon>
                                        </v-btn>
                                        <div class="mx-2">{{ item.newAmount }}</div>
                                        <v-btn icon @click="increaseAmount(item)">
                                            <v-icon>mdi-plus</v-icon>
                                        </v-btn>
                                        <v-btn color="primary" class="ml-4" @click="updateQuantity(item)">Cập
                                            nhật</v-btn>
                                        <v-btn color="primary" class="ml-4"
                                            @click="() => { checkoutItem = item; showCheckout = true; }">Đặt
                                            hàng</v-btn>
                                    </div>
                                    <div><strong>Thành tiền:</strong> {{ (item.newAmount *
                                        item.unit_price).toLocaleString() }}₫</div>
                                </v-card-text>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mt-4">
                <v-col cols="12" class="text-right" v-if="cartItems.length">
                </v-col>
            </v-row>

        </div>

        <div v-else>
            <v-alert type="warning" border="start" class="mt-5">Vui lòng đăng nhập để xem giỏ hàng của bạn.</v-alert>
        </div>

        <!-- FORM THANH TOÁN -->
        <v-dialog v-model="showCheckout" max-width="800px">
            <v-card class="rounded-xl pa-6">
                <v-card-title class="text-h5 font-weight-bold mb-4">Thông tin thanh toán</v-card-title>
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <v-text-field label="Họ và tên người nhận" v-model="checkoutForm.name" required />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field label="Số điện thoại" v-model="checkoutForm.phone" required />
                        </v-col>
                        <v-row dense>
                            <v-col cols="12" sm="4">
                                <v-select label="Tỉnh/Thành" :items="provinces" item-title="name" item-value="id"
                                    v-model="checkoutForm.province_id"
                                    @update:model-value="(val) => fetchDistricts(val)" />
                            </v-col>

                            <v-col cols="12" sm="4">
                                <v-select label="Quận/Huyện" :items="districts" item-title="name" item-value="id"
                                    v-model="checkoutForm.district_id" @update:model-value="(val) => fetchWards(val)" />
                            </v-col>

                            <v-col cols="12" sm="4">
                                <v-select label="Phường/Xã" :items="wards" item-title="name" item-value="id"
                                    v-model="checkoutForm.ward_id" />
                            </v-col>
                        </v-row>

                        <v-col cols="12">
                            <v-text-field label="Địa chỉ cụ thể (số nhà, tên đường...)"
                                v-model="checkoutForm.address" />
                        </v-col>
                        <v-col cols="12">
                            <v-radio-group v-model="checkoutForm.paymentMethod" inline>
                                <v-radio label="Thanh toán qua ZaloPay" value="zalopay" />
                                <v-radio label="Thanh toán khi nhận hàng (COD)" value="cod" />
                            </v-radio-group>
                        </v-col>
                    </v-row>

                    <v-divider class="my-4" />
                    <h4 class="text-h6 mb-2">Sản phẩm</h4>
                    <v-row v-if="checkoutItem" class="mb-3">
                        <v-col cols="3">
                            <v-img :src="getImageUrl(checkoutItem.imgName)" height="80" width="80" class="rounded-lg"
                                cover />
                        </v-col>
                        <v-col cols="9">
                            <div class="font-weight-bold">{{ checkoutItem.product_name }}</div>
                            <div>Số lượng: {{ checkoutItem.newAmount }}</div>
                            <div class="text-primary">Giá tiền: {{ (checkoutItem.unit_price *
                                checkoutItem.newAmount).toLocaleString() }}₫</div>
                        </v-col>
                    </v-row>

                    <div class="text-right font-weight-bold mt-3">
                        Tổng tiền: {{ (checkoutItem.unit_price * checkoutItem.newAmount).toLocaleString() }}₫
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="showCheckout = false">Hủy</v-btn>
                    <v-btn color="primary" @click="handleCheckout" :loading="isPaying">Thanh toán</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- DIALOG XEM ĐƠN ĐÃ ĐẶT -->
        <v-dialog v-model="showBills" max-width="800px">
            <v-card class="rounded-xl pa-6">
                <v-card-title class="text-h5 font-weight-bold mb-4">Đơn đã đặt</v-card-title>
                <v-card-text>
                    <v-alert v-if="!bills.length" type="info">Bạn chưa có đơn hàng nào.</v-alert>
                    <v-expansion-panels v-else>
                        <v-expansion-panel v-for="(bill, index) in bills" :key="index">
                            <v-expansion-panel-title>
                                Đơn #{{ bill.id }} - {{ new Date(bill.created_at).toLocaleString() }}
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                                <div v-for="(item, i) in bill.items" :key="i" class="mb-3">
                                    <div class="font-weight-bold">{{ item.product_name }}</div>
                                    <div>Số lượng: {{ item.amount }}</div>
                                    <div>Giá: {{ item.unit_price.toLocaleString() }}₫</div>
                                </div>
                                <div class="text-right font-weight-bold">Tổng tiền: {{ bill.total_price.toLocaleString()
                                }}₫</div>
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn text @click="showBills = false">Đóng</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<style scoped>
.mt-5 {
    margin-top: 50px;
}
</style>
