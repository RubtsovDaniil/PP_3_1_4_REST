package ru.kata.spring.boot_security.demo.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.dao.UserDao;
import ru.kata.spring.boot_security.demo.exeptionhandler.NoSuchUserException;
import ru.kata.spring.boot_security.demo.exeptionhandler.UserAlreadyExistsException;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserDao userDao;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserDao userDao, RoleService roleService, PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.userDao = userDao;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    @Override
    public List<User> getAllUsers() {
        return userDao.getAllUsers();
    }

    @Override
    public User getUserById(long id) {
        return userDao.getUserById(id)
                .orElseThrow(() ->
                        new NoSuchUserException("User with id " + id + " not found"));
    }

    @Override
    public Optional<User> getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return Optional.empty();
            }

            String username = auth.getName();
            return userRepository.findByUsername(username);

        } catch (Exception e) {
            // Логируем ошибку, но возвращаем empty чтобы не прерывать работу приложения
            System.err.println("Error getting current user: " + e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    @Transactional
    public User saveUser(User user, List<Long> newRoleIds) {
        Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
        if (existingUser.isPresent()) {
            throw new UserAlreadyExistsException("User with email " + user.getUsername() + " already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        setUserRoles(user, newRoleIds);
        return userDao.saveUser(user);
    }

    @Override
    @Transactional
    public void deleteUser(long id) {
        getUserById(id);
        userDao.deleteUser(id);
    }

    private void setUserRoles(User user, List<Long> roleIds) {
        if (roleIds != null && !roleIds.isEmpty()) {
            Set<Role> roles = roleIds.stream()
                    .map(roleService::getRoleById)
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }
    }

    @Transactional
    @Override
    public void updateUser(long id, User user, List<Long> selectedRoleIds) {
        user.setId(id);
        User existingUser = getUserById(user.getId());
        existingUser.setName(user.getName());
        existingUser.setLastName(user.getLastName());
        existingUser.setAge(user.getAge());

        if (!existingUser.getUsername().equals(user.getUsername())) {
            // Если email изменился, проверяем не занят ли новый email
            Optional<User> userWithNewEmail = userRepository.findByUsername(user.getUsername());
            if (userWithNewEmail.isPresent() && userWithNewEmail.get().getId() != id) {
                throw new UserAlreadyExistsException("User with email " + user.getUsername() + " already exists");
            }
            existingUser.setUsername(user.getUsername());
        }

        // Обновляем пароль только если он не пустой
        if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        setUserRoles(existingUser, selectedRoleIds);
        userDao.updateUser(existingUser);
    }
}
