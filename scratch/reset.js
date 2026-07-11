const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }
  
  if (data.users.length === 0) {
    console.log("No users found.");
  } else {
    data.users.forEach(u => {
      console.log(`User: ${u.email}`);
    });
    
    // Reset password for the first user or admin@smartist.pe
    const adminUser = data.users.find(u => u.email === 'admin@smartist.pe') || data.users[0];
    if (adminUser) {
      console.log(`Resetting password for ${adminUser.email} to 'smartist2026'`);
      const { error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
        password: 'smartist2026'
      });
      if (updateError) {
        console.error("Failed to update password:", updateError);
      } else {
        console.log("Password updated successfully!");
      }
    }
  }
}

checkUsers();
