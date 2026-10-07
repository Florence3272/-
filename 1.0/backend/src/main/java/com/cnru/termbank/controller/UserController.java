package com.cnru.termbank.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cnru.termbank.common.ApiException;
import com.cnru.termbank.common.Result;
import com.cnru.termbank.dto.Requests;
import com.cnru.termbank.entity.TermDatabase;
import com.cnru.termbank.entity.User;
import com.cnru.termbank.entity.UserDatabaseRole;
import com.cnru.termbank.mapper.TermDatabaseMapper;
import com.cnru.termbank.mapper.UserDatabaseRoleMapper;
import com.cnru.termbank.mapper.UserMapper;
import com.cnru.termbank.security.UserContext;
import com.cnru.termbank.service.AuditService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserMapper userMapper;
    private final TermDatabaseMapper databaseMapper;
    private final UserDatabaseRoleMapper roleMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserController(UserMapper userMapper, TermDatabaseMapper databaseMapper,
                          UserDatabaseRoleMapper roleMapper, PasswordEncoder passwordEncoder,
                          AuditService auditService) {
        this.userMapper = userMapper;
        this.databaseMapper = databaseMapper;
        this.roleMapper = roleMapper;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @GetMapping("/me")
    public Result<User> me() {
        return Result.ok(userMapper.selectById(UserContext.require().id));
    }

    @PutMapping("/me")
    public Result<User> updateMe(@RequestBody Requests.ProfileReq req) {
        UserContext.CurrentUser cu = UserContext.require();
        User update = new User();
        update.setId(cu.id);
        update.setName(req.getName());
        update.setEmail(req.getEmail());
        update.setPhone(req.getPhone());
        update.setAvatar(req.getAvatar());
        update.setBio(req.getBio());
        userMapper.updateById(update);
        auditService.log(cu.id, "update_profile", "user", cu.id, req);
        return Result.ok(userMapper.selectById(cu.id), "已保存");
    }

    @PutMapping("/me/password")
    public Result<Void> changePassword(@Valid @RequestBody Requests.PasswordReq req) {
        UserContext.CurrentUser cu = UserContext.require();
        User user = userMapper.selectById(cu.id);
        if (!passwordEncoder.matches(req.getOldPassword(), user.getPasswordHash())) {
            throw ApiException.badRequest("原密码不正确");
        }
        User update = new User();
        update.setId(cu.id);
        update.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userMapper.updateById(update);
        auditService.log(cu.id, "change_password", "user", cu.id, null);
        return Result.ok(null, "密码已修改");
    }

    @GetMapping("/me/databases")
    public Result<List<TermDatabase>> myDatabases() {
        Long uid = UserContext.require().id;
        List<UserDatabaseRole> roles = roleMapper.selectList(new QueryWrapper<UserDatabaseRole>().eq("userId", uid));
        List<Long> dbIds = roles.stream().map(UserDatabaseRole::getDbId).collect(java.util.stream.Collectors.toList());
        QueryWrapper<TermDatabase> w = new QueryWrapper<>();
        w.eq("status", "active");
        if (dbIds.isEmpty()) {
            w.eq("ownerId", uid);
        } else {
            w.and(q -> q.eq("ownerId", uid).or().in("id", dbIds));
        }
        w.orderByDesc("updatedAt");
        return Result.ok(databaseMapper.selectList(w));
    }
}
