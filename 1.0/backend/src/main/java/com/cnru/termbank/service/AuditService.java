package com.cnru.termbank.service;

import com.cnru.termbank.entity.AuditLog;
import com.cnru.termbank.mapper.AuditLogMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

/** 操作审计 */
@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogMapper auditLogMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuditService(AuditLogMapper auditLogMapper) {
        this.auditLogMapper = auditLogMapper;
    }

    public void log(Long userId, String action, String targetType, Long targetId, Object detail) {
        try {
            AuditLog entity = new AuditLog();
            entity.setUserId(userId);
            entity.setAction(action);
            entity.setTargetType(targetType);
            entity.setTargetId(targetId);
            if (detail != null) {
                entity.setDetail(objectMapper.writeValueAsString(detail));
            }
            HttpServletRequest req = currentRequest();
            if (req != null) {
                String xff = req.getHeader("X-Forwarded-For");
                entity.setIp(xff != null ? xff : req.getRemoteAddr());
                String ua = req.getHeader("User-Agent");
                entity.setUserAgent(ua != null && ua.length() > 500 ? ua.substring(0, 500) : ua);
            }
            auditLogMapper.insert(entity);
        } catch (Exception e) {
            log.warn("[audit] failed: {}", e.getMessage());
        }
    }

    private HttpServletRequest currentRequest() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attrs != null ? attrs.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }
}
