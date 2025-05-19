<template>
    <v-container>
        <Header />
        <div class="d-flex justify-space-between align-center mb-4">
            <h2 class="text-h5 font-weight-bold">Quản lý sản phẩm</h2>
            <v-btn color="primary" @click="dialog = true">
                <v-icon start>mdi-plus</v-icon> Thêm sản phẩm
            </v-btn>
        </div>

        <v-data-table :headers="headers" :items="products" :items-per-page="10" class="elevation-1">
            <template #item.image="{ item }">
                <v-img :src="`http://localhost:8080/api/images/${item.imgName}`" max-width="80" max-height="80"
                    cover></v-img>
            </template>
            <template #item.actions="{ item }">
                <!-- <v-btn icon @click="editProduct(item.id)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn> -->
                <v-btn icon @click="deleteProduct(item)">
                    <v-icon color="red">mdi-delete</v-icon>
                </v-btn>

                <v-btn icon @click="openImportDialog(item)">
                    <v-icon color="green">mdi-database-plus</v-icon>
                </v-btn>
            </template>

        </v-data-table>

        <!-- Dialog thêm sản phẩm -->
        <v-dialog v-model="dialog" max-width="600px">
            <v-card>
                <v-card-title class="text-h6 font-weight-bold">Thêm sản phẩm mới</v-card-title>
                <v-card-text>
                    <v-form ref="formRef">
                        <v-text-field label="Tên sản phẩm" v-model="newProduct.name" required />
                        <v-text-field label="Giá" v-model="newProduct.price" type="number" required />
                        <v-text-field label="Mô tả" v-model="newProduct.description" />

                        <v-file-input v-model="imageFile" label="Ảnh sản phẩm" accept="image/*"
                            prepend-icon="mdi-camera" required />
                        <v-file-input v-model="illustrationFiles" label="Ảnh minh hoạ" accept="image/*" multiple
                            prepend-icon="mdi-image-multiple" />


                        <v-select label="Loại sản phẩm" :items="types" item-title="name" item-value="id"
                            v-model="newProduct.type_id" />
                        <v-select label="Thương hiệu" :items="brands" item-title="name" item-value="id"
                            v-model="newProduct.brand_id" />
                        <v-row>
                            <v-col cols="9">
                                <v-select label="Kích cỡ" :items="sizes"
                                    :item-title="item => `${item.size} (${item.unit})`" item-value="id"
                                    v-model="newProduct.size_id" />
                            </v-col>

                            <v-col cols="3">
                                <v-btn color="primary" block @click="addSizeDialog = true">Thêm size</v-btn>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="9">
                                <v-select label="Màu sắc" :items="colors" item-title="color" item-value="id"
                                    v-model="newProduct.color_id" />
                            </v-col>
                            <v-col cols="3">
                                <v-btn color="primary" block @click="colorDialog = true">Thêm màu</v-btn>
                            </v-col>
                        </v-row>

                        <v-select label="Giảm giá" :items="discounts" item-title="discount_name" item-value="id"
                            v-model="newProduct.discount_id" />
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="dialog = false">Huỷ</v-btn>
                    <v-btn color="primary" @click="submitProduct">Thêm</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Dialog nhập hàng -->
        <v-dialog v-model="importDialog" max-width="400px">
            <v-card>
                <v-card-title class="text-h6">Nhập hàng cho: {{ selectedProduct?.name }}</v-card-title>
                <v-card-text>
                    <v-text-field v-model="importAmount" type="number" label="Số lượng thêm" min="1" required />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="importDialog = false">Huỷ</v-btn>
                    <v-btn color="primary" @click="submitImport">Xác nhận</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="colorDialog" max-width="400px">
            <v-card>
                <v-card-title class="text-h6 font-weight-bold">Thêm màu mới</v-card-title>
                <v-card-text>
                    <v-text-field v-model="newColor" label="Tên màu" required />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="colorDialog = false">Huỷ</v-btn>
                    <v-btn color="primary" @click="submitNewColor">Thêm</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="addSizeDialog" max-width="400px">
            <v-card>
                <v-card-title class="text-h6">Thêm kích cỡ</v-card-title>
                <v-card-text>
                    <v-text-field v-model="newSize.size" label="Kích cỡ (vd: 40)" required />
                    <v-text-field v-model="newSize.unit" label="Đơn vị (vd: EU, US...)" required />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="addSizeDialog = false">Huỷ</v-btn>
                    <v-btn color="primary" @click="submitNewSize">Thêm</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <Footer />
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Header from './Header.vue'
import Footer from './Footer.vue'
const router = useRouter()
const dialog = ref(false)
const formRef = ref(null)
const colorDialog = ref(false)
const newColor = ref('')

const products = ref([])
const types = ref([])
const brands = ref([])
const sizes = ref([])
const colors = ref([])
const discounts = ref([])
const imageFile = ref(null)
const illustrationFiles = ref([]) 

const newProduct = ref({
    name: '',
    price: 0,
    description: '',
    imgName: '',
    productImages: [],
    type_id: null,
    brand_id: null,
    size_id: null,
    color_id: null,
    discount_id: 1
})

const headers = [
    { title: 'Hình ảnh', value: 'image', align: 'start' },
    { title: 'Tên sản phẩm', value: 'name' },
    { title: 'Giá', value: 'price' },
    { title: 'Loại', value: 'type' },
    { title: 'Số lượng', value: 'amount' },
    { title: 'Hành động', value: 'actions', sortable: false }
]

const fetchProducts = async () => {
    try {
        const token = localStorage.getItem('access_token')
        const res = await axios.get('http://localhost:8080/api/products', {
            headers: { Authorization: `Bearer ${token}` }
        })
        // console.log(res.data)
        products.value = res.data.data || []
    } catch (err) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', err)
    }
}

const fetchDropdownData = async () => {
    try {
        const token = localStorage.getItem('access_token')
        const headers = { Authorization: `Bearer ${token}` }

        const [typeRes, brandRes, sizeRes, colorRes, discountRes] = await Promise.all([
            axios.get('http://localhost:8080/api/product-infor/types', { headers }),
            axios.get('http://localhost:8080/api/product-infor/brands', { headers }),
            axios.get('http://localhost:8080/api/product-infor/sizes', { headers }),
            axios.get('http://localhost:8080/api/product-infor/colors', { headers }),
            axios.get('http://localhost:8080/api/product-infor/discounts', { headers })
        ])

        types.value = typeRes.data.data
        brands.value = brandRes.data.data
        sizes.value = sizeRes.data.data
        colors.value = colorRes.data.data
        discounts.value = discountRes.data.data
    } catch (err) {
        console.error('Lỗi khi lấy dữ liệu dropdown:', err)
    }
}

// const editProduct = (id) => {
//     router.push(`/admin/products/${id}/edit`)
// }

const deleteProduct = async (product) => {
    if (confirm('Bạn có chắc muốn xoá sản phẩm này?')) {
        try {
            // console.log("sp:" + product)
            const token = localStorage.getItem('access_token');
            await axios.delete(`http://localhost:8080/api/products/${product.id}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { imgName: product.imgName } // Gửi tên ảnh vào body
            });
            products.value = products.value.filter(p => p.id !== product.id);
            fetchProducts();
        } catch (err) {
            console.error('Lỗi khi xoá sản phẩm:', err);
        }
    }
}


const submitProduct = async () => {
    try {
        const token = localStorage.getItem('access_token')

        // 1. Upload ảnh nếu có chọn ảnh
        if (imageFile.value) {
            const formData = new FormData()
            formData.append('image', imageFile.value)

            const uploadRes = await axios.post('http://localhost:8080/api/images/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            // console.log(uploadRes.data)
            // Gán tên ảnh trả về vào newProduct.imgName
            newProduct.value.imgName = uploadRes.data.filename

        }
        const illustrationNames = []
        if (illustrationFiles.value && illustrationFiles.value.length > 0) {
            for (const file of illustrationFiles.value) {
                const formData = new FormData()
                formData.append('image', file)

                const res = await axios.post('http://localhost:8080/api/images/upload', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                })
                illustrationNames.push(res.data.filename)
            }
            newProduct.value.productImages = illustrationNames;
        }
        // 2. Gửi thông tin sản phẩm kèm imgName đã upload
        const res = await axios.post('http://localhost:8080/api/products', newProduct.value, {
            headers: { Authorization: `Bearer ${token}` }
        })

        // 3. Cập nhật UI
        products.value.push(res.data.data)
        dialog.value = false

        // Reset form và ảnh
        Object.assign(newProduct.value, {
            name: '',
            price: 0,
            description: '',
            imgName: '',
            productImages: [],
            type_id: null,
            brand_id: null,
            size_id: null,
            color_id: null,
            discount_id: null
        })
        imageFile.value = null
    } catch (err) {
        console.error('Lỗi khi thêm sản phẩm:', err)
    }
}
const importDialog = ref(false)
const selectedProduct = ref(null)
const importAmount = ref(0)

const openImportDialog = (product) => {
    selectedProduct.value = product
    importAmount.value = 0
    importDialog.value = true
}

const submitImport = async () => {
    try {
        const token = localStorage.getItem('access_token')

        if (!importAmount.value || importAmount.value <= 0) {
            alert("Vui lòng nhập số lượng hợp lệ")
            return
        }
        // console.log(selectedProduct.value);
        await axios.put(`http://localhost:8080/api/admin/add_product/${selectedProduct.value.id}`, {
            add_amount: importAmount.value
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        importDialog.value = false
        fetchProducts() // reload lại danh sách sản phẩm

    } catch (err) {
        console.error('Lỗi khi nhập hàng:', err)
        alert('Có lỗi xảy ra khi nhập hàng')
    }
}

const submitNewColor = async () => {
    if (!newColor.value.trim()) {
        alert('Vui lòng nhập tên màu!')
        return
    }

    try {
        const token = localStorage.getItem('access_token')
        const res = await axios.post('http://localhost:8080/api/product-infor/colors', {
            color: newColor.value.trim()
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })

        // Thêm màu mới vào danh sách và chọn nó
        fetchDropdownData();

        // Reset
        newColor.value = ''
        colorDialog.value = false
    } catch (err) {
        console.error('Lỗi khi thêm màu mới:', err)
        alert('Thêm màu thất bại!')
    }
}
const addSizeDialog = ref(false)
const newSize = ref({ size: '', unit: '' })

const submitNewSize = async () => {
    const token = localStorage.getItem('access_token')
    try {
        const res = await axios.post('http://localhost:8080/api/product-infor/sizes', newSize.value, {
            headers: { Authorization: `Bearer ${token}` }
        })
        fetchDropdownData();
        addSizeDialog.value = false;
        newSize.value = { size: '', unit: '' }
    } catch (err) {
        console.error('Lỗi khi thêm kích cỡ:', err)
        alert('Thêm kích cỡ thất bại')
    }
}

onMounted(() => {
    fetchProducts()
    fetchDropdownData()
})
</script>