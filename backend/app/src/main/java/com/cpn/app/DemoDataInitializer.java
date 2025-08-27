package com.cpn.app;

import com.cpn.app.AuthModule.UserDemoDataLoader;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
@Component
public record DemoDataInitializer(
        List<UserDemoDataLoader> demoDataLoaders
) implements CommandLineRunner {
    @Override
    public void run(String... args) throws Exception {
        demoDataLoaders.forEach(UserDemoDataLoader::loadDemoData);
    }
}
