package ru.kata.spring.boot_security.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.dao.RoleDaoImpl;
import ru.kata.spring.boot_security.demo.model.Role;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class RoleServiceImpl implements RoleService {
    private final RoleDaoImpl roleDaoImpl;

    @Autowired
    public RoleServiceImpl(RoleDaoImpl roleDaoImpl) {
        this.roleDaoImpl = roleDaoImpl;
    }

    @Override
    public List<Role> getAllRoles() {
        return roleDaoImpl.getAllRoles();
    }

    @Override
    public Role getRoleByName(String roleName) {
        return roleDaoImpl.getRoleByName(roleName);
    }

    @Transactional
    @Override
    public void saveRole(Role role) {
        roleDaoImpl.saveRole(role);
    }
}
