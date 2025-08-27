package com.cpn.app.base;

import java.util.List;

public interface BaseCrudService<ENTITY, ID> {
    ENTITY create(ENTITY entity);
    List<ENTITY> findAll();
    ENTITY findById(ID id);
    ENTITY update(ID id, ENTITY entity);
    void delete(ID id);
}
