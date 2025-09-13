package ru.kata.spring.boot_security.demo.service;


import javax.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.dao.UserDao;
import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserDao userDao, PasswordEncoder passwordEncoder) {
        this.userDao = userDao;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<User> getAllUsers() {
        return userDao.getAllUsers();
    }

    @Override
    public User getUserById(long id) {
        return userDao.getUserById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("User with id " + id + " not found"));
    }

    @Override
    public User getUserByUsername(String username) {
        return userDao.getUserByUsername(username);
    }

    @Override
    @Transactional
    public void saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userDao.saveUser(user);
    }

    @Override
    @Transactional
    public void deleteUser(long id) {
        userDao.deleteUser(id);
    }

    @Override
    @Transactional
    public void updateUser(User user) {
        if (user.getId() != null) {
            Optional<User> existingUserOpt = userDao.getUserById(user.getId());
            if (existingUserOpt.isPresent()) {
                User existingUser = existingUserOpt.get();
                existingUser.setName(user.getName());
                existingUser.setLastName(user.getLastName());
                existingUser.setAge(user.getAge());
                existingUser.setUsername(user.getUsername());
                // Обновляем пароль только если он не пустой
                if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
                    existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
                }
                existingUser.setRoles(user.getRoles());
            }
        }
    }
}
