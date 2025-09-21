package ru.kata.spring.boot_security.demo.dao;

import org.springframework.stereotype.Repository;
import ru.kata.spring.boot_security.demo.model.Role;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import java.util.List;

@Repository
public class RoleDaoImpl implements RoleDao {
    @PersistenceContext
    private EntityManager em;

    @Override
    public List<Role> getAllRoles() {
        return em.createQuery("select r from Role r", Role.class).getResultList();
    }

    @Override
    public Role getRoleByName(String roleName) {
        TypedQuery<Role> query = em.createQuery
                ("select r from Role r where r.name = :roleName", Role.class);
        query.setParameter("roleName", roleName);
        return query.getResultList().stream().findFirst().orElse(null);
    }

    @Override
    public void saveRole(Role role) {
        em.persist(role);
    }
}
