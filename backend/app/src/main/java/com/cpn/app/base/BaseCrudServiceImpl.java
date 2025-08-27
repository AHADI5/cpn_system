package com.cpn.app.base;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public abstract class BaseCrudServiceImpl<ENTITY, ID>
        implements BaseCrudService<ENTITY, ID> {

    protected abstract JpaRepository<ENTITY, ID> getRepository();

    @Override
    public ENTITY findById(ID id) {
        return getRepository().findById(id).orElseThrow(EntityNotFoundException::new);
    }
    @Override
    public ENTITY create(ENTITY entity) {
        return getRepository().save(entity);
    }

    @Override
    public List<ENTITY> findAll() {
        return getRepository().findAll();
    }

    @Override
    public ENTITY update(ID id, ENTITY entity) {
        if (!getRepository().existsById(id)) {
            throw new EntityNotFoundException("Entity not found with ID: " + id);
        }
        return getRepository().save(entity);
    }

    @Override
    public void delete(ID id) {
        if (!getRepository().existsById(id)) {
            throw new EntityNotFoundException("Entity not found with ID: " + id);
        }
        getRepository().deleteById(id);
    }
}
