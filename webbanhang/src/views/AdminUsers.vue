<template>
  <v-container>
    <Header />

    <h1 class="text-h5 mb-4">Quản lý tài khoản</h1>

    <!-- Tabs chuyển đổi -->
    <v-tabs v-model="currentTab" background-color="primary" dark>
      <v-tab value="users">Người dùng</v-tab>
      <v-tab value="employees">Nhân viên</v-tab>
    </v-tabs>

    <!-- Nút thêm nhân viên chỉ hiện khi đang xem tab nhân viên -->
    <v-btn
      color="primary"
      class="my-4"
      @click="dialog = true"
      v-if="currentTab === 'employees'"
    >
      Thêm tài khoản nhân viên
    </v-btn>

    <!-- Bảng danh sách người dùng hoặc nhân viên -->
    <v-simple-table class="custom-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Tên người dùng</th>
        <th>Họ tên</th>
        <th>Email</th>
        <th>SĐT</th>
        <th>Địa chỉ</th>
        <th>Trạng thái</th>
        <th>Hành động</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in filteredUsers" :key="user.id">
        <td>{{ user.id }}</td>
        <td>{{ user.username }}</td>
        <td>{{ user.name }}</td>
        <td>{{ user.email }}</td>
        <td>{{ user.phone_number }}</td>
        <td>{{ user.ward }}, {{ user.district }}, {{ user.province }}</td>
        <td>{{ user.state }}</td>
        <td>
          <v-btn
            color="error"
            size="small"
            @click="banUser(user.id)"
            v-if="user.state !== 'Cấm' && currentTab === 'users'"
          >
            🚫 Cấm
          </v-btn>
          <span v-else-if="user.state === 'Cấm'">Đã cấm</span>
        </td>
      </tr>
    </tbody>
  </v-simple-table>

    <v-alert type="info" v-if="filteredUsers.length === 0" class="mt-4">
      Không có người dùng nào.
    </v-alert>

    <!-- Dialog thêm nhân viên -->
    <v-dialog v-model="dialog" max-width="500px" attach="body">
      <v-card>
        <v-card-title>
          <span class="text-h6">Tạo tài khoản nhân viên</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="formRefEl" v-model="valid" lazy-validation>
            <v-text-field
              v-model="form.username"
              label="Tên đăng nhập"
              :rules="[v => !!v || 'Bắt buộc']"
              required
            />
            <v-text-field
              v-model="form.name"
              label="Họ tên"
              :rules="[v => !!v || 'Bắt buộc']"
              required
            />
            <v-text-field
              v-model="form.email"
              label="Email"
              :rules="[
                v => !!v || 'Bắt buộc',
                v => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
              ]"
              required
            />
            <v-text-field
              v-model="form.phone_number"
              label="Số điện thoại"
              :rules="[v => !!v || 'Bắt buộc']"
              required
            />
            <v-text-field
              v-model="form.password"
              label="Mật khẩu"
              type="password"
              :rules="[v => !!v || 'Bắt buộc']"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog = false">Huỷ</v-btn>
          <v-btn color="primary" @click="submitForm">Tạo</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <Footer />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Header from './Header.vue'
import Footer from './Footer.vue'

const dialog = ref(false)
const valid = ref(false)
const formRefEl = ref(null)
const form = ref({
  username: '',
  name: '',
  email: '',
  phone_number: '',
  password: '',
})

const users = ref([])

// Biến lưu trạng thái tab hiện tại ('users' hoặc 'employees')
const currentTab = ref('users')

const filteredUsers = computed(() =>
  users.value.filter(user =>
    currentTab.value === 'users' ? user.role === 'User' : user.role === 'Employee'
  )
)

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('access_token')
    const res = await axios.get('http://localhost:8080/api/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    users.value = res.data.data
  } catch (err) {
    console.error('Lỗi khi lấy danh sách user:', err)
  }
}

const submitForm = async () => {
  if (!valid.value) {
    if (formRefEl.value && formRefEl.value.validate) formRefEl.value.validate()
    return
  }
  try {
    const token = localStorage.getItem('access_token')
    await axios.post(
      'http://localhost:8080/api/admin/create-employee',
      {
        username: form.value.username,
        name: form.value.name,
        email: form.value.email,
        phone_number: form.value.phone_number,
        password: form.value.password,
        role: 'Employee',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    alert('Tạo tài khoản nhân viên thành công!')
    dialog.value = false
    form.value = {
      username: '',
      name: '',
      email: '',
      phone_number: '',
      password: '',
    }
    await fetchUsers()
  } catch (error) {
    alert('Lỗi khi tạo tài khoản: ' + (error.response?.data?.message || error.message))
  }
}

const banUser = async (id) => {
  try {
    const token = localStorage.getItem('access_token')
    await axios.put(
      `http://localhost:8080/api/admin/ban/${id}`,
      { status_id: 3 },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    await fetchUsers()
  } catch (err) {
    console.error(`Lỗi khi cấm user ${id}:`, err)
  }
}

onMounted(fetchUsers)
</script>
<style scoped>
.custom-table {
  border-collapse: separate !important;
  border-spacing: 0 8px;
  width: 100%;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.custom-table thead th {
  background-color: #1976d2; /* Vuetify primary color */
  color: white;
  font-weight: 600;
  padding: 12px 16px;
  text-align: left;
  user-select: none;
}

.custom-table tbody tr {
  background-color: white;
  transition: box-shadow 0.3s ease;
  cursor: pointer;
  border-radius: 6px;
}

.custom-table tbody tr:hover {
  box-shadow: 0 4px 10px rgb(25 118 210 / 0.3);
}

.custom-table tbody td {
  padding: 12px 16px;
  vertical-align: middle;
}

/* Tô màu xen kẽ từng dòng */
.custom-table tbody tr {
  background-color: #333232;
}
</style>