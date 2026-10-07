package com.cnru.termbank.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cnru.termbank.common.ApiException;
import com.cnru.termbank.common.Result;
import com.cnru.termbank.dto.Requests;
import com.cnru.termbank.entity.Note;
import com.cnru.termbank.mapper.NoteMapper;
import com.cnru.termbank.security.UserContext;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {

    private final NoteMapper noteMapper;

    public NoteController(NoteMapper noteMapper) {
        this.noteMapper = noteMapper;
    }

    @GetMapping
    public Result<List<Note>> list(@RequestParam(required = false) String search) {
        Long uid = UserContext.require().id;
        QueryWrapper<Note> w = new QueryWrapper<>();
        w.eq("userId", uid);
        if (search != null && !search.isEmpty()) {
            w.and(q -> q.like("title", search).or().like("content", search));
        }
        w.orderByDesc("updatedAt");
        return Result.ok(noteMapper.selectList(w));
    }

    @PostMapping
    public Result<Note> create(@RequestBody Requests.NoteReq req) {
        Long uid = UserContext.require().id;
        Note note = new Note();
        note.setUserId(uid);
        note.setTargetType(req.getTargetType());
        note.setTargetId(req.getTargetId());
        note.setTitle(req.getTitle());
        note.setContent(req.getContent());
        noteMapper.insert(note);
        return Result.ok(note, "已保存");
    }

    @PutMapping("/{id}")
    public Result<Note> update(@PathVariable Long id, @RequestBody Requests.NoteReq req) {
        Long uid = UserContext.require().id;
        Note existing = noteMapper.selectOne(new QueryWrapper<Note>().eq("id", id).eq("userId", uid).last("LIMIT 1"));
        if (existing == null) throw ApiException.notFound("笔记不存在");
        Note note = new Note();
        note.setId(id);
        note.setTitle(req.getTitle());
        note.setContent(req.getContent());
        noteMapper.updateById(note);
        return Result.ok(noteMapper.selectById(id), "已更新");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        Long uid = UserContext.require().id;
        noteMapper.delete(new QueryWrapper<Note>().eq("id", id).eq("userId", uid));
        return Result.ok(null, "已删除");
    }
}
