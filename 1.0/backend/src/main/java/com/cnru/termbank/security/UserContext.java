package com.cnru.termbank.security;

import com.cnru.termbank.common.ApiException;

/** 当前请求用户（ThreadLocal），由 AuthInterceptor 写入 */
public class UserContext {

    public static class CurrentUser {
        public Long id;
        public String username;
        public String name;
        public String role;
        public String status;

        public CurrentUser(Long id, String username, String name, String role, String status) {
            this.id = id;
            this.username = username;
            this.name = name;
            this.role = role;
            this.status = status;
        }

        public boolean isAdmin() { return "admin".equals(role); }
    }

    private static final ThreadLocal<CurrentUser> HOLDER = new ThreadLocal<>();

    public static void set(CurrentUser user) { HOLDER.set(user); }

    public static CurrentUser get() { return HOLDER.get(); }

    public static void clear() { HOLDER.remove(); }

    /** 必须登录 */
    public static CurrentUser require() {
        CurrentUser u = HOLDER.get();
        if (u == null) throw ApiException.unauthorized("请先登录");
        return u;
    }

    /** 必须系统管理员 */
    public static CurrentUser requireAdmin() {
        CurrentUser u = require();
        if (!u.isAdmin()) throw ApiException.forbidden("需要管理员权限");
        return u;
    }
}
