package com.cnru.termbank.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cnru.termbank.common.ApiException;
import com.cnru.termbank.common.Result;
import com.cnru.termbank.dto.Requests;
import com.cnru.termbank.entity.User;
import com.cnru.termbank.mapper.UserMapper;
import com.cnru.termbank.security.JwtUtil;
import com.cnru.termbank.security.UserContext;
import com.cnru.termbank.service.AuditService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Pattern USERNAME_RE = Pattern.compile("^[a-zA-Z0-9_\\u4e00-\\u9fa5]{3,20}$");

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public AuthController(UserMapper userMapper, JwtUtil jwtUtil,
                          PasswordEncoder passwordEncoder, AuditService auditService) {
        this.userMapper = userMapper;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @PostMapping("/register")
    public Result<Map<String, Object>> register(@Valid @RequestBody Requests.RegisterReq req) {
        if (!USERNAME_RE.matcher(req.getUsername()).matches()) {
            throw ApiException.badRequest("用户名只能含字母、数字、下划线和汉字，长度3-20");
        }
        Long exists = userMapper.selectCount(new QueryWrapper<User>().eq("username", req.getUsername()));
        if (exists != null && exists > 0) throw ApiException.conflict("用户名已存在");

        User user = new User();
        user.setUsername(req.getUsername());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setName(req.getName() == null || req.getName().isEmpty() ? req.getUsername() : req.getName());
        user.setEmail(req.getEmail());
        user.setRole("user");
        user.setStatus("active");
        user.setLastSignInAt(LocalDateTime.now());
        userMapper.insert(user);

        auditService.log(user.getId(), "register", "user", user.getId(), null);
        return Result.ok(tokenPayload(user.getId()), "注册成功");
    }

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody Requests.LoginReq req) {
        User user = userMapper.selectOne(new QueryWrapper<User>().eq("username", req.getUsername()).last("LIMIT 1"));
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw ApiException.unauthorized("用户名或密码错误");
        }
        if (!"active".equals(user.getStatus())) throw ApiException.forbidden("账号已被禁用");

        User update = new User();
        update.setId(user.getId());
        update.setLastSignInAt(LocalDateTime.now());
        userMapper.updateById(update);

        auditService.log(user.getId(), "login", "user", user.getId(), null);
        return Result.ok(tokenPayload(user.getId()), "登录成功");
    }

    @GetMapping("/me")
    public Result<User> me() {
        UserContext.CurrentUser cu = UserContext.get();
        if (cu == null) return Result.ok(null);
        return Result.ok(userMapper.selectById(cu.id));
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        UserContext.require();
        return Result.ok();
    }

    private Map<String, Object> tokenPayload(Long userId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("token", jwtUtil.createToken(userId));
        data.put("userId", userId);
        return data;
    }
}
