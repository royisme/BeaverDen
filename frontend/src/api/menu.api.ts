import { getApiClient } from '@/lib/api-client';
import type { MenuItem } from '@/types/menu';

/**
 * 获取用户菜单
 * 
 * 获取当前用户可访问的所有菜单项
 */
export async function fetchUserMenus(): Promise<MenuItem[]> {
  const apiClient = await getApiClient();
  const response = await apiClient.getClient().get('/menus/user-menus');
  return response;
}

/**
 * 获取菜单组
 * 
 * 获取按组分类的菜单，用于侧边栏显示
 */
export async function fetchMenuGroups(): Promise<any[]> {
  const apiClient = await getApiClient();
  const response = await apiClient.getClient().get('/menus/menu-groups');
  return response;
}
