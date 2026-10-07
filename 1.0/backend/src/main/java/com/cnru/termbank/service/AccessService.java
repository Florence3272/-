package com.cnru.termbank.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cnru.termbank.common.ApiException;
import com.cnru.termbank.entity.TermDatabase;
import com.cnru.termbank.entity.Term;
import com.cnru.termbank.entity.UserDatabaseRole;
import com.cnru.termbank.mapper.TermDatabaseMapper;
import com.cnru.termbank.mapper.TermMapper;
import com.cnru.termbank.mapper.UserDatabaseRoleMapper;
import com.cnru.termbank.security.UserContext;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/** 分库权限与术语计数 */
@Service
public class AccessService {

    private static final Map<String, Integer> RANK = new HashMap<>();

    static {
        RANK.put("viewer", 1);
        RANK.put("editor", 2);
        RANK.put("admin", 3);
    }

    private final TermDatabaseMapper databaseMapper;
    private final UserDatabaseRoleMapper roleMapper;
    private final TermMapper termMapper;

    public AccessService(TermDatabaseMapper databaseMapper,
                         UserDatabaseRoleMapper roleMapper,
                         TermMapper termMapper) {
        this.databaseMapper = databaseMapper;
        this.roleMapper = roleMapper;
        this.termMapper = termMapper;
    }

    /** 用户在分库中的有效角色；系统管理员/库主视为 admin */
    public String resolveRole(UserContext.CurrentUser user, Long dbId) {
        if (user == null) return null;
        if (user.isAdmin()) return "admin";
        TermDatabase db = databaseMapper.selectById(dbId);
        if (db != null && db.getOwnerId() != null && db.getOwnerId().equals(user.id)) return "admin";
        UserDatabaseRole role = roleMapper.selectOne(new QueryWrapper<UserDatabaseRole>()
                .eq("userId", user.id).eq("dbId", dbId).last("LIMIT 1"));
        return role != null ? role.getRole() : null;
    }

    /** 断言至少具备 allow 中最低权限 */
    public String assertAccess(UserContext.CurrentUser user, Long dbId, String... allow) {
        if (user == null) throw ApiException.unauthorized("请先登录");
        String role = resolveRole(user, dbId);
        int min = Integer.MAX_VALUE;
        for (String r : allow) min = Math.min(min, RANK.getOrDefault(r, 99));
        if (role == null || RANK.getOrDefault(role, 0) < min) throw ApiException.forbidden("无权操作该分库");
        return role;
    }

    /** 私有/团队分库要求登录且为成员 */
    public void assertReadable(UserContext.CurrentUser user, Long dbId) {
        TermDatabase db = databaseMapper.selectById(dbId);
        if (db == null) throw ApiException.notFound("分库不存在");
        if ("public".equals(db.getVisibility())) return;
        if (user == null) throw ApiException.unauthorized("该分库需要登录后访问");
        if (resolveRole(user, dbId) == null) throw ApiException.forbidden("无权访问该分库");
    }

    /** 重算分库术语数 */
    public void refreshTermCount(Long dbId) {
        QueryWrapper<Term> w = new QueryWrapper<>();
        w.eq("dbId", dbId).eq("status", "active");
        long count = termMapper.selectCount(w);
        TermDatabase update = new TermDatabase();
        update.setId(dbId);
        update.setTermCount((int) count);
        databaseMapper.updateById(update);
    }

    public String minRole(String... allow) {
        return Arrays.stream(allow).min((a, b) -> RANK.getOrDefault(b, 99) - RANK.getOrDefault(a, 99)).orElse("viewer");
    }
}
