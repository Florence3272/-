package com.cnru.termbank.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cnru.termbank.common.Result;
import com.cnru.termbank.dto.Requests;
import com.cnru.termbank.entity.Favorite;
import com.cnru.termbank.mapper.FavoriteMapper;
import com.cnru.termbank.security.UserContext;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/favorites")
public class FavoriteController {

    private final FavoriteMapper favoriteMapper;

    public FavoriteController(FavoriteMapper favoriteMapper) {
        this.favoriteMapper = favoriteMapper;
    }

    @GetMapping
    public Result<List<Map<String, Object>>> list() {
        return Result.ok(favoriteMapper.listWithTerm(UserContext.require().id));
    }

    @PostMapping
    public Result<Void> add(@RequestBody Requests.FavoriteReq req) {
        Long uid = UserContext.require().id;
        Favorite existing = favoriteMapper.selectOne(new QueryWrapper<Favorite>()
                .eq("userId", uid).eq("targetType", req.getTargetType()).eq("targetId", req.getTargetId())
                .last("LIMIT 1"));
        if (existing != null) {
            if (req.getNotes() != null) {
                existing.setNotes(req.getNotes());
                favoriteMapper.updateById(existing);
            }
        } else {
            Favorite f = new Favorite();
            f.setUserId(uid);
            f.setTargetType(req.getTargetType());
            f.setTargetId(req.getTargetId());
            f.setNotes(req.getNotes());
            favoriteMapper.insert(f);
        }
        return Result.ok(null, "已收藏");
    }

    @DeleteMapping("/{id}")
    public Result<Void> remove(@PathVariable Long id) {
        Long uid = UserContext.require().id;
        favoriteMapper.delete(new QueryWrapper<Favorite>().eq("id", id).eq("userId", uid));
        return Result.ok(null, "已取消收藏");
    }

    @DeleteMapping("/target")
    public Result<Void> removeByTarget(@RequestParam String targetType, @RequestParam Long targetId) {
        Long uid = UserContext.require().id;
        favoriteMapper.delete(new QueryWrapper<Favorite>()
                .eq("userId", uid).eq("targetType", targetType).eq("targetId", targetId));
        return Result.ok(null, "已取消收藏");
    }

    @GetMapping("/check")
    public Result<Map<String, Object>> check(@RequestParam String targetType, @RequestParam Long targetId) {
        Long uid = UserContext.require().id;
        Favorite f = favoriteMapper.selectOne(new QueryWrapper<Favorite>()
                .eq("userId", uid).eq("targetType", targetType).eq("targetId", targetId).last("LIMIT 1"));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("favorited", f != null);
        out.put("id", f == null ? null : f.getId());
        return Result.ok(out);
    }
}
