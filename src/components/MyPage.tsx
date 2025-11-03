import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { User, Building2, Briefcase, Phone, Mail, Edit2, Check, X, LogOut, Trash2, Users, Shield, Upload, Camera, Palette } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import type { TeamMember, Team } from '../App';
import * as api from '../utils/api';
import { projectId } from '../utils/supabase/info';

interface MyPageProps {
  currentUser: TeamMember;
  currentTeam: Team;
  accessToken: string;
  onUpdateUser: (updates: Partial<TeamMember>) => void;
  onLogout: () => void;
}

export function MyPage({ currentUser, currentTeam, accessToken, onUpdateUser, onLogout }: MyPageProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.name);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [editedRole, setEditedRole] = useState(currentUser.role);
  const [isEditingColor, setIsEditingColor] = useState(false);
  const [selectedColor, setSelectedColor] = useState(currentUser.color);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error('이름을 입력해주세요');
      return;
    }

    try {
      // Update member name through API
      const { data, error } = await api.updateMember(
        currentTeam.id,
        currentUser.id,
        { name: editedName.trim() },
        accessToken
      );

      if (error) {
        toast.error('이름 변경 실패');
        console.error('Update name error:', error);
        return;
      }

      onUpdateUser({ name: editedName.trim() });
      setIsEditingName(false);
      toast.success('이름이 변경되었습니다');
    } catch (error) {
      console.error('Save name error:', error);
      toast.error('이름 변경 중 오류가 발생했습니다');
    }
  };

  const handleSaveRole = async () => {
    if (!editedRole.trim()) {
      toast.error('직책을 입력해주세요');
      return;
    }

    try {
      const { data, error } = await api.updateMember(
        currentTeam.id,
        currentUser.id,
        { role: editedRole.trim() },
        accessToken
      );

      if (error) {
        toast.error('직책 변경 실패');
        console.error('Update role error:', error);
        return;
      }

      onUpdateUser({ role: editedRole.trim() });
      setIsEditingRole(false);
      toast.success('직책이 변경되었습니다');
    } catch (error) {
      console.error('Save role error:', error);
      toast.error('직책 변경 중 오류가 발생했습니다');
    }
  };

  const handleCancelNameEdit = () => {
    setEditedName(currentUser.name);
    setIsEditingName(false);
  };

  const handleCancelRoleEdit = () => {
    setEditedRole(currentUser.role);
    setIsEditingRole(false);
  };

  const handleSaveColor = async () => {
    try {
      const { data, error } = await api.updateMember(
        currentTeam.id,
        currentUser.id,
        { color: selectedColor },
        accessToken
      );

      if (error) {
        toast.error('프로필 컬러 변경 실패');
        console.error('Update color error:', error);
        return;
      }

      onUpdateUser({ color: selectedColor });
      setIsEditingColor(false);
      toast.success('프로필 컬러가 변경되었습니다');
    } catch (error) {
      console.error('Save color error:', error);
      toast.error('프로필 컬러 변경 중 오류가 발생했습니다');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하로 업로드해주세요');
      return;
    }

    setUploadingImage(true);

    try {
      // Upload to server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', currentUser.id);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3afd3c70/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { avatarUrl } = await response.json();

      // Update member with avatar URL
      const { data, error } = await api.updateMember(
        currentTeam.id,
        currentUser.id,
        { avatar: avatarUrl },
        accessToken
      );

      if (error) {
        toast.error('프로필 이미지 업데이트 실패');
        return;
      }

      onUpdateUser({ avatar: avatarUrl });
      toast.success('프로필 이미지가 업데이트되었습니다');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('이미지 업로드 중 오류가 발생했습니다');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      if (confirm('모든 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?')) {
        localStorage.clear();
        onLogout();
        toast.success('계정이 삭제되었습니다');
      }
    }
  };

  const memberCount = currentTeam.members?.length || 0;
  const isTeamOwner = currentTeam.createdBy === currentUser.id;

  const colorPresets = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
    '#10B981', '#06B6D4', '#6366F1', '#14B8A6', '#F97316',
    '#84CC16', '#A855F7', '#EAB308', '#22D3EE', '#F43F5E'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-slate-900 mb-2">마이페이지</h1>
          <p className="text-sm text-slate-600">프로필 정보와 팀 설정을 관리하세요</p>
        </div>

        {/* Profile Card */}
        <Card className="p-6 toss-shadow">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative group">
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
                    style={{ backgroundColor: currentUser.color }}
                  >
                    <User size={32} />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  ) : (
                    <Camera size={20} className="text-white" />
                  )}
                </button>
              </div>
              <div>
                <h2 className="text-slate-900">{currentUser.name}</h2>
                <p className="text-sm text-slate-600">{currentUser.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isTeamOwner && (
                <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs flex items-center gap-1.5">
                  <Shield size={14} />
                  팀장
                </div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Profile Info */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label className="text-slate-700 mb-2 block">이름</Label>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') handleCancelNameEdit();
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveName}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelNameEdit}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-slate-500" />
                    <span className="text-slate-900">{currentUser.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingName(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={14} />
                  </Button>
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <Label className="text-slate-700 mb-2 block">직책</Label>
              {isEditingRole ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedRole}
                    onChange={(e) => setEditedRole(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRole();
                      if (e.key === 'Escape') handleCancelRoleEdit();
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveRole}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelRoleEdit}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className="text-slate-500" />
                    <span className="text-slate-900">{currentUser.role}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingRole(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={14} />
                  </Button>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <Label className="text-slate-700 mb-2 block">이메일</Label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail size={18} className="text-slate-500" />
                <span className="text-slate-900">{currentUser.email}</span>
              </div>
            </div>

            {/* Color */}
            <div>
              <Label className="text-slate-700 mb-2 block">프로필 컬러</Label>
              {isEditingColor ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-2">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-full aspect-square rounded-lg transition-all ${
                          selectedColor === color 
                            ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' 
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Palette size={18} className="text-slate-500" />
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="flex-1"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveColor}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <Check size={16} className="mr-1" />
                      저장
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedColor(currentUser.color);
                        setIsEditingColor(false);
                      }}
                      className="flex-1"
                    >
                      <X size={16} className="mr-1" />
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg shadow-sm"
                      style={{ backgroundColor: currentUser.color }}
                    />
                    <span className="text-slate-900">{currentUser.color}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingColor(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={14} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Team Info Card */}
        <Card className="p-6 toss-shadow">
          <h3 className="text-slate-900 mb-4 flex items-center gap-2">
            <Users size={20} />
            팀 정보
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-slate-700 mb-2 block">현재 팀</Label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Building2 size={18} className="text-slate-500" />
                <span className="text-slate-900">{currentTeam.name}</span>
              </div>
            </div>

            <div>
              <Label className="text-slate-700 mb-2 block">팀원 수</Label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Users size={18} className="text-slate-500" />
                <span className="text-slate-900">{memberCount}명</span>
              </div>
            </div>

            <div>
              <Label className="text-slate-700 mb-2 block">초대 코드</Label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <code className="text-lg tracking-widest text-blue-600">
                  {currentTeam.inviteCode}
                </code>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                이 코드를 팀원에게 공유하여 팀에 초대할 수 있습니다
              </p>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 toss-shadow border-red-200">
          <h3 className="text-red-600 mb-4">위험 영역</h3>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start text-slate-700 border-slate-300 hover:bg-slate-50"
              onClick={onLogout}
            >
              <LogOut size={18} className="mr-2" />
              로그아웃
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50"
              onClick={handleDeleteAccount}
            >
              <Trash2 size={18} className="mr-2" />
              계정 삭제
            </Button>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
