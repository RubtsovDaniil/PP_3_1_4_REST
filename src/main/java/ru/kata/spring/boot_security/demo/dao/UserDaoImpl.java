package ru.kata.spring.boot_security.demo.dao;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

import org.springframework.stereotype.Repository;
import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public class UserDaoImpl implements UserDao {

    @PersistenceContext
    private EntityManager em;

    public UserDaoImpl() {
    }

    @Override
    public List<User> getAllUsers() {
        return em.createQuery
                ("SELECT u FROM User u", User.class).getResultList();
    }

    @Override
    public Optional<User> getUserById(long id) {
        return Optional.ofNullable(em.find(User.class, id));
    }

    @Override
    public User getUserByUsername(String username) {
        TypedQuery<User> query = em.createQuery(
                "SELECT u FROM User u WHERE u.username = :username", User.class);
        query.setParameter("username", username);
        return query.getResultList().stream().findFirst().orElse(null);
    }

    @Override
    public void saveUser(User user) {
        em.persist(user);
    }

    @Override
    public void deleteUser(long id) {
        em.remove(em.find(User.class, id));
    }

    @Override
    public void updateUser(User user) {
        em.merge(user);
    }
}
