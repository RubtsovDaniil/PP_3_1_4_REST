// Общий файл JavaScript
$(document).ready(function () {
    // Загружаем таблицу пользователей при загрузке страницы
    if ($("#users-table").length) {
        loadUsers();
    }

    // Загружаем информацию о текущем пользователе
    if ($("#user-info-tbody").length) {
        loadCurrentUser();
    }

    // Загружаем роли для форм
    if ($("#new-user-roles").length) {
        loadRoles();
    }

    // Обработчик для кнопки добавления нового пользователя
    $('#addNewUser').click(function (e) {
        e.preventDefault();
        createUser();
    });

    // Обработчик для кнопки редактирования
    $(document).on('click', '.edit-button', function () {
        const userId = $(this).data('id');
        openEditModal(userId);
    });

    // Обработчик для сохранения отредактированного пользователя
    $('#saveEditBtn').click(function () {
        updateUser();
    });

    // Обработчик для кнопки удаления
    $(document).on('click', '.delete-button', function () {
        const userId = $(this).data('id');
        openDeleteModal(userId);
    });

    // Обработчик для подтверждения удаления
    $('#confirmDeleteBtn').click(function () {
        deleteUser();
    });

    // Очистка данных при закрытии модального окна удаления
    $('#deleteModal').on('hidden.bs.modal', function () {
        $(this).removeData('userId');
        $('#deleteUserForm')[0].reset();
        $('#deleteRolesList').empty();
    });
});

// Функция загрузки всех пользователей
function loadUsers() {
    fetch('/api/users')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load users: ' + response.status);
            }
        })
        .then(users => {
            console.log("Users data:", users);

            if (users && users.length > 0) {
                let tbody = '';

                users.forEach(user => {
                    console.log(`User ${user.id}:`, user);

                    // Упрощенная обработка ролей
                    let rolesBadges = '';
                    if (user.roles && user.roles.length > 0) {
                        user.roles.forEach(role => {
                            const roleName = role.name || role;
                            const displayName = roleName.replace('ROLE_', '');
                            rolesBadges += `<span class="badge badge-pill badge-primary mr-1">${displayName}</span>`;
                        });
                    } else {
                        rolesBadges = '<span class="badge badge-pill badge-secondary mr-1">NO ROLES</span>';
                    }

                    tbody += `
                    <tr>
                        <td>${user.id || ''}</td>
                        <td>${user.name || ''}</td>
                        <td>${user.lastName || ''}</td>
                        <td>${user.age || ''}</td>
                        <td>${user.username || ''}</td>
                        <td>${rolesBadges}</td>
                        <td>
                            <button class="btn btn-info btn-sm edit-button" data-id="${user.id}">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                        </td>
                        <td>
                            <button class="btn btn-danger btn-sm delete-button" data-id="${user.id}">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </td>
                    </tr>`;
                });

                $('#users-table tbody').html(tbody);
                $('#no-users').hide();
                $('#users-table').show();
            } else {
                $('#users-table tbody').html('');
                $('#no-users').show();
                $('#users-table').hide();
            }
        })
        .catch(error => {
            console.error('Error loading users:', error);
            showAlert('error', 'Error loading users: ' + error.message);
            $('#no-users').show();
            $('#users-table').hide();
        });
}

// Функция загрузки информации о текущем пользователе
function loadCurrentUser() {
    fetch('/api/users/current')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load user information: ' + response.status);
            }
        })
        .then(user => {
            console.log("Current user data:", user);

            if (user && user.id) {
                let rolesBadges = '';
                if (user.roles && user.roles.length > 0) {
                    user.roles.forEach(role => {
                        const roleName = role.name || role;
                        const displayName = roleName.replace('ROLE_', '');
                        rolesBadges += `<span class="badge badge-pill badge-primary mr-1">${displayName}</span>`;
                    });
                }

                const userHtml = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.lastName}</td>
                    <td>${user.age}</td>
                    <td>${user.username}</td>
                    <td>${rolesBadges}</td>
                </tr>`;

                $('#user-info-tbody').html(userHtml);
                $('#user-table').show();
                $('#user-not-found').hide();
            } else {
                $('#user-table').hide();
                $('#user-not-found').show();
            }
        })
        .catch(error => {
            console.error('Error loading user information:', error);
            $('#user-table').hide();
            $('#user-not-found').show();
            $('#user-not-found p').text('Error loading user information: ' + error.message);
        });
}

// Функция загрузки ролей для форм
function loadRoles() {
    fetch('/api/roles')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load roles: ' + response.status);
            }
        })
        .then(roles => {
            console.log("Roles data:", roles);

            if (roles && roles.length > 0) {
                // Загружаем роли для формы создания нового пользователя
                let newUserRolesHtml = '';
                roles.forEach(role => {
                    newUserRolesHtml += `
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="roles" id="role_${role.id}" value="${role.name}">
                        <label class="form-check-label" for="role_${role.id}">${role.name.replace('ROLE_', '')}</label>
                    </div>`;
                });

                $('#new-user-roles').html(newUserRolesHtml);
            } else {
                $('#new-user-roles').html('<div class="alert alert-warning">No roles found</div>');
            }
        })
        .catch(error => {
            console.error('Error loading roles:', error);
            $('#new-user-roles').html('<div class="alert alert-danger">Error loading roles</div>');
        });
}

// Функция создания нового пользователя
function createUser() {
    // Собираем данные формы
    const name = $('#firstName').val();
    const lastName = $('#lastName').val();
    const age = $('#age').val();
    const username = $('#username').val();
    const password = $('#password').val();

    // Собираем выбранные роли
    const selectedRoles = [];
    $('input[name="roles"]:checked').each(function () {
        selectedRoles.push($(this).val());
    });

    // Валидация
    if (!name || !lastName || !age || !username || !password) {
        showAlert('error', 'All fields are required');
        return;
    }

    // Создаем объект пользователя
    const user = {
        name: name,
        lastName: lastName,
        age: parseInt(age),
        username: username,
        password: password
    };

    // Проверяем, что есть хотя бы одна роль
    if (selectedRoles.length === 0) {
        selectedRoles.push("ROLE_USER");
    }

    // Создаем URL с параметрами ролей
    const url = '/api/users?' + selectedRoles.map(role => `roles=${encodeURIComponent(role)}`).join('&');

    console.log("Creating user:", user);
    console.log("URL:", url);

    // Отправляем запрос
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to create user: ' + response.status);
            }
        })
        .then(data => {
            showAlert('success', 'User successfully created');
            $('#addUserForm')[0].reset(); // Сброс формы
            loadUsers();
        })
        .catch(error => {
            console.error('Error creating user:', error);
            showAlert('error', 'Error creating user: ' + error.message);
        });
}

// Функция открытия модального окна для редактирования
function openEditModal(userId) {
    // Сначала загружаем роли
    fetch('/api/roles')
        .then(response => response.json())
        .then(roles => {
            let rolesHtml = '';
            roles.forEach(role => {
                rolesHtml += `
                <div class="form-check">
                    <input class="form-check-input edit-role" type="checkbox" name="editRoles" id="editRole_${role.id}" value="${role.name}">
                    <label class="form-check-label" for="editRole_${role.id}">${role.name.replace('ROLE_', '')}</label>
                </div>`;
            });

            $('#edit-user-roles').html(rolesHtml);

            // Теперь загружаем данные пользователя
            return fetch('/api/users/' + userId);
        })
        .then(response => response.json())
        .then(user => {
            console.log("User for edit:", user);

            $('#editId').val(user.id);
            $('#editFirstName').val(user.name);
            $('#editLastName').val(user.lastName);
            $('#editAge').val(user.age);
            $('#editEmail').val(user.username);
            $('#editPassword').val('');

            // Отмечаем роли пользователя
            if (user.roles && user.roles.length > 0) {
                user.roles.forEach(role => {
                    const roleName = role.name || role;
                    $(`#edit-user-roles input[value="${roleName}"]`).prop('checked', true);
                });
            }

            // Если ни одна роль не отмечена, отметим USER по умолчанию
            if ($('#edit-user-roles input:checked').length === 0) {
                $('#edit-user-roles input[value="ROLE_USER"]').prop('checked', true);
            }

            // Открываем модальное окно
            $('#editModal').modal('show');
        })
        .catch(error => {
            console.error('Error opening edit modal:', error);
            showAlert('error', 'Error loading user data: ' + error.message);
        });

}

// Функция обновления пользователя
function updateUser() {
    const userId = $('#editId').val();
    const name = $('#editFirstName').val();
    const lastName = $('#editLastName').val();
    const age = $('#editAge').val();
    const username = $('#editEmail').val();
    const password = $('#editPassword').val();

    // Собираем выбранные роли
    const selectedRoles = [];
    $('input[name="editRoles"]:checked').each(function () {
        selectedRoles.push($(this).val());
    });

    // Валидация
    if (!name || !lastName || !age || !username) {
        showAlert('error', 'Name, Last Name, Age and Email are required');
        return;
    }

    // Создаем объект пользователя
    const user = {
        id: parseInt(userId),
        name: name,
        lastName: lastName,
        age: parseInt(age),
        username: username
    };

    // Добавляем пароль только если он был введен
    if (password) {
        user.password = password;
    }

    // Проверяем, что есть хотя бы одна роль
    if (selectedRoles.length === 0) {
        selectedRoles.push("ROLE_USER");
    }

    // Создаем URL с параметрами ролей
    const url = '/api/users?' + selectedRoles.map(role => `roles=${encodeURIComponent(role)}`).join('&');

    console.log("Updating user:", user);
    console.log("URL:", url);

    // Отправляем запрос
    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to update user: ' + response.status);
            }
        })
        .then(data => {
            showAlert('success', 'User successfully updated');
            $('#editModal').modal('hide');
            loadUsers();
        })
        .catch(error => {
            console.error('Error updating user:', error);
            showAlert('error', 'Error updating user: ' + error.message);
        });
}

// Функция открытия модального окна для удаления
function openDeleteModal(userId) {
    console.log("Opening delete modal for user ID:", userId);

    fetch('/api/users/' + userId)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load user: ' + response.status);
            }
            return response.json();
        })
        .then(user => {
            console.log("User data for deletion:", user);

            // Заполняем форму данными пользователя
            $('#deleteId').val(user.id || '');
            $('#deleteFirstName').val(user.name || '');
            $('#deleteLastName').val(user.lastName || '');
            $('#deleteAge').val(user.age || '');
            $('#deleteEmail').val(user.username || '');

            // Отображаем роли пользователя
            displayUserRoles(user.roles, '#deleteRolesList');

            // Сохраняем ID пользователя для удаления
            $('#deleteModal').data('userId', userId);

            // Открываем модальное окно
            $('#deleteModal').modal('show');
        })
        .catch(error => {
            console.error('Error opening delete modal:', error);
            showAlert('error', 'Error loading user data: ' + error.message);
        });
}

// Функция отображения ролей пользователя
function displayUserRoles(roles, containerSelector) {
    let rolesHtml = '';

    if (roles && roles.length > 0) {
        roles.forEach(role => {
            const roleName = role.name || role;
            const displayName = roleName.replace('ROLE_', '');
            rolesHtml += `<span class="badge badge-primary mr-1">${displayName}</span>`;
        });
    } else {
        rolesHtml = '<span class="text-muted">No roles assigned</span>';
    }

    $(containerSelector).html(rolesHtml);
}

// Функция удаления пользователя
function deleteUser() {
    const userId = $('#deleteModal').data('userId');

    if (!userId) {
        showAlert('error', 'User ID not found');
        return;
    }

    console.log("Deleting user with ID:", userId);

    fetch('/api/users/' + userId, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                showAlert('success', 'User successfully deleted');
                $('#deleteModal').modal('hide');
                loadUsers(); // Обновляем таблицу пользователей
            } else {
                throw new Error('Failed to delete user: ' + response.status);
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            showAlert('error', 'Error deleting user: ' + error.message);
        });
}

// Функция отображения уведомлений
function showAlert(type, message) {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const alertHtml = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`;

    $('#alert-container').html(alertHtml);

    // Автоматически скрываем сообщение через 5 секунд
    setTimeout(function () {
        $('.alert').alert('close');
    }, 5000);
}