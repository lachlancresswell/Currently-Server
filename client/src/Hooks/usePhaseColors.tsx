export function usePhaseColors() {
    const element = document.documentElement;
    const l1Color = getComputedStyle(element).getPropertyValue('--l1-color');
    const l2Color = getComputedStyle(element).getPropertyValue('--l2-color');
    const l3Color = getComputedStyle(element).getPropertyValue('--l3-color');
    return {
        l1Color, l2Color, l3Color
    }
}