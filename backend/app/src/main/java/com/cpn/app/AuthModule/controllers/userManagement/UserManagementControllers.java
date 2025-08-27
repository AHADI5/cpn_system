package com.cpn.app.AuthModule.controllers.userManagement;



import com.cpn.app.AuthModule.dtos.requests.UserRequest;
import com.cpn.app.AuthModule.dtos.responses.UserResponse;
import com.cpn.app.AuthModule.model.User;
import com.cpn.app.AuthModule.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/v1/users")
public record UserManagementControllers(
        UserService service
) {

    @PostMapping("/")
    public ResponseEntity<String> createUser(@RequestBody UserRequest userRequest) {
        User user = service.createUser(userRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body("User created" + " " + user.getUsername()) ;
    }

    @GetMapping("/")
    public ResponseEntity<List<UserResponse>> getUsers() {
        List<UserResponse> userResponses = new ArrayList<>();
        List<User> users = service.findAll();
        for (User user : users) {
            userResponses.add(UserResponse.toDto(user));
        }
        return ResponseEntity.status(HttpStatus.OK).body(userResponses);
    }

    @GetMapping("/{userID}")
    public ResponseEntity<UserResponse> getUser(@PathVariable("userID") long userID) {
        User user = service.findById(userID) ;
        return ResponseEntity.status(HttpStatus.OK).body(UserResponse.toDto(user));
    }

    @PutMapping("/{userID}")
    public ResponseEntity<String> updateUser(@RequestBody UserRequest userRequest , @PathVariable("userID") long userID) {
        service.updateUser(userRequest, userID) ;
        return ResponseEntity.status(HttpStatus.OK).body("User updated");
    }

    @DeleteMapping("/{userID}")
    public ResponseEntity<String> deleteUser(@PathVariable("userID") long userID) {
        service.delete(userID); ;
        return ResponseEntity.status(HttpStatus.OK).body("User deleted");

    }

    @PostMapping("/enable/{userID}")
    public ResponseEntity<String> enableUser(@PathVariable("userID") long userID) {
        service.enableUser(userID) ;
        return ResponseEntity.status(HttpStatus.OK).body("User enabled");
    }

    @PostMapping("/disable/{userID}")
    public ResponseEntity<String> disableUser(@PathVariable("userID") long userID) {
        service.disableUser(userID) ;
        return ResponseEntity.status(HttpStatus.OK).body("User disabled");
    }


    //TODO : Lock a user
}
