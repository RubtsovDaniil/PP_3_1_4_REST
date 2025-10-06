package ru.kata.spring.boot_security.demo.service;


import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;
import java.util.Optional;


public interface UserService {

    List<User> getAllUsers();

    User getUserById(long id);

    Optional<User> getCurrentUser();

    User saveUser(User user, List<Long> roleIds);

    void deleteUser(long id);

    void updateUser(long id, User user, List<Long> roleIds);

}
