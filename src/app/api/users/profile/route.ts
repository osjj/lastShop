import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = createSupabaseServerClient();

  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未认证' } },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_ERROR', message: '获取用户信息失败' } },
        { status: 500 }
      );
    }

    const userProfile = {
      id: user.id,
      email: user.email!,
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      phone: profile?.phone,
      avatarUrl: profile?.avatar_url,
      role: profile?.role || 'customer',
      status: profile?.status || 'active',
      createdAt: user.created_at,
      updatedAt: profile?.updated_at || user.created_at,
    };

    return NextResponse.json({
      success: true,
      data: userProfile,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const supabase = createSupabaseServerClient();

  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未认证' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, avatarUrl } = body;

    // Update user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'UPDATE_FAILED', message: '更新用户信息失败' } },
        { status: 400 }
      );
    }

    const updatedProfile = {
      id: user.id,
      email: user.email!,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      phone: data.phone,
      avatarUrl: data.avatar_url,
      role: data.role || 'customer',
      status: data.status || 'active',
      createdAt: user.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: '用户信息更新成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}
