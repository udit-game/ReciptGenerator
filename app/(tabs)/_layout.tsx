import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/Context/ThemeContext';

export default function TabsLayout() {
  const { currentTheme: colors } = useAppTheme();

  return (
     <NativeTabs
        backgroundColor={colors.card}
        tintColor={colors.brand}
        indicatorColor={colors.brand}
        iconColor={{
          default: colors.textSecondary,
          selected: colors.text,
        }}
        labelStyle={{
          default: { color: colors.textSecondary },
          selected: { color: colors.text },
        }}
     >
      <NativeTabs.Trigger name="Home">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }} 
          src={
            <NativeTabs.Trigger.VectorIcon
              family={MaterialIcons}
              name="home"
            />
          }
        />
      </NativeTabs.Trigger>
      {/* <NativeTabs.Trigger name="Stats">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} 
          src={
            <NativeTabs.Trigger.VectorIcon
              family={MaterialIcons}
              name="bar-chart"
            />
          }
        />
        <NativeTabs.Trigger.Label>Stats</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger> */}
      <NativeTabs.Trigger name="History">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'clock', selected: 'clock.fill' }} 
          src={
            <NativeTabs.Trigger.VectorIcon
              family={MaterialIcons}
              name="access-time"
            />
          }
        />
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="Logs">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'terminal', selected: 'terminal.fill' }} 
          src={
            <NativeTabs.Trigger.VectorIcon
              family={MaterialIcons}
              name="terminal"
            />
          }
        />
        <NativeTabs.Trigger.Label>Logs</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}