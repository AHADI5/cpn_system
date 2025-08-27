package com.cpn.app.AuthModule.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UserRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userRoleID;
    private String roleName;
    private String description;
    @ManyToMany(mappedBy = "userRoles")
    private List<User> users;
}
