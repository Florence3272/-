package com.cnru.termbank.security;

import com.cnru.termbank.entity.User;
import com.cnru.termbank.mapper.UserMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    public AuthInterceptor(JwtUtil jwtUtil, UserMapper userMapper) {
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        String token = request.getHeader("x-auth-token");
        if (token == null || token.isEmpty()) {
            String auth = request.getHeader("Authorization");
            if (auth != null && auth.toLowerCase().startsWith("bearer ")) {
                token = auth.substring(7).trim();
            }
        }
        if (token != null && !token.isEmpty()) {
            Long userId = jwtUtil.parseUserId(token);
            if (userId != null) {
                User user = userMapper.selectById(userId);
                if (user != null && "active".equals(user.getStatus())) {
                    UserContext.set(new UserContext.CurrentUser(
                            user.getId(), user.getUsername(), user.getName(),
                            user.getRole(), user.getStatus()));
                }
            }
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        UserContext.clear();
    }
}
